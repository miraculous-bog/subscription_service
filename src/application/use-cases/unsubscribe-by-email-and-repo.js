const {
	findByEmailAndRepositoryFullName,
  } = require("../../infrastructure/repositories/subscription.repository.impl");
  const { unsubscribe } = require("./unsubscribe");
  const { AppError } = require("../../shared/errors/app-error");
  const { isValidRepoName } = require("../../shared/utils/validate-repo-name");
  
  const unsubscribeByEmailAndRepo = async ({ email, repo }) => {
	if (!email || !repo) {
	  throw new AppError("Email and repo are required", 400);
	}
  
	if (!isValidRepoName(repo)) {
	  throw new AppError("Invalid input", 400);
	}
  
	const normalizedEmail = email.toLowerCase();
  
	const subscription = await findByEmailAndRepositoryFullName(
	  normalizedEmail,
	  repo
	);
  
	if (!subscription) {
	  throw new AppError("Subscription not found", 404);
	}
  
	if (!subscription.unsubscribeToken) {
	  throw new AppError("Unsubscribe token not found", 404);
	}
  
	return unsubscribe(subscription.unsubscribeToken);
  };
  
  module.exports = {
	unsubscribeByEmailAndRepo,
  };