const { findByFullName, create: createGithubRepository } = require("../../infrastructure/repositories/github-repository.repository.impl");
const {
  findByEmailAndRepositoryId,
  create: createSubscription,
} = require("../../infrastructure/repositories/subscription.repository.impl");
const { checkRepositoryExists } = require("../../infrastructure/services/github.service");
const { sendConfirmationEmail } = require("../../infrastructure/services/email.service");
const { generateToken } = require("../../shared/utils/tokens");
const { isValidRepoName } = require("../../shared/utils/validate-repo-name");

const subscribeToRepo = async ({ email, repo }) => {
  if (!email || !repo) {
    throw new Error("Email and repo are required");
  }

  if (!isValidRepoName(repo)) {
    throw new Error("Invalid repository format");
  }

  const repositoryExists = await checkRepositoryExists(repo);

  if (!repositoryExists) {
    throw new Error("Repository not found");
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
    throw new Error("Email already subscribed to this repository");
  }

  const confirmToken = generateToken();
  const unsubscribeToken = generateToken();

  await createSubscription({
    email: normalizedEmail,
    repositoryId: githubRepository._id,
    status: "pending",
    confirmToken,
    unsubscribeToken,
  });

  await sendConfirmationEmail(normalizedEmail, confirmToken);

  return {
    message: "Subscription successful. Confirmation email sent.",
  };
};

module.exports = {
  subscribeToRepo,
};