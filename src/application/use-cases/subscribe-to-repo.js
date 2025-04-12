const { findByFullName, create: createGithubRepository } = require("../../infrastructure/repositories/github-repository.repository.impl");
const {
  findByEmailAndRepositoryId,
  create: createSubscription,
  reactivateById,
} = require("../../infrastructure/repositories/subscription.repository.impl");
const { checkRepositoryExists } = require("../../infrastructure/services/github.service");
const { sendConfirmationEmail } = require("../../infrastructure/services/email.service");
const { generateToken } = require("../../shared/utils/tokens");
const { isValidRepoName } = require("../../shared/utils/validate-repo-name");
const { AppError } = require("../../shared/errors/app-error");

const {
	subscriptionsCreatedTotal,
	subscriptionReactivatedTotal,
  } = require("../../infrastructure/metrics/metrics");

const subscribeToRepo = async ({ email, repo }) => {
  if (!email || !repo) {
    throw new AppError("Email and repo are required", 400);
  }

  if (!isValidRepoName(repo)) {
    throw new AppError("Invalid input", 400);
  }

  const repositoryExists = await checkRepositoryExists(repo);

  if (!repositoryExists) {
    throw new AppError("Repository not found on GitHub", 404);
  }

  let githubRepository = await findByFullName(repo);

  if (!githubRepository) {
    const [owner, name] = repo.split("/");

    githubRepository = await createGithubRepository({
      owner,
      name,
      fullName: repo,
    });
  }

  const normalizedEmail = email.toLowerCase();

  const existingSubscription = await findByEmailAndRepositoryId(
    normalizedEmail,
    githubRepository._id
  );

  if (existingSubscription && existingSubscription.status !== "unsubscribed") {
    throw new AppError("Email already subscribed to this repository", 409);
  }

  const confirmToken = generateToken();
  const unsubscribeToken = generateToken();
  await sendConfirmationEmail(
    normalizedEmail,
    confirmToken,
    unsubscribeToken,
	repo
  );

  if (existingSubscription && existingSubscription.status === "unsubscribed") {
    await reactivateById(existingSubscription._id, {
      confirmToken,
      unsubscribeToken,
    });
	subscriptionReactivatedTotal.inc();
    return {
      message: "Subscription successful. Confirmation email sent.",
    };
  }

  await createSubscription({
    email: normalizedEmail,
    repositoryId: githubRepository._id,
    status: "pending",
    confirmToken,
    unsubscribeToken,
  });
  subscriptionsCreatedTotal.inc();
  return {
    message: "Subscription successful. Confirmation email sent.",
  };
};

module.exports = {
  subscribeToRepo,
};