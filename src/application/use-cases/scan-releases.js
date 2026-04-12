const {
	findAll,
	updateLastSeenTagById,
	touchLastCheckedAtById,
  } = require("../../infrastructure/repositories/github-repository.repository.impl");
  const { findActiveByRepositoryId } = require("../../infrastructure/repositories/subscription.repository.impl");
  const { getLatestRelease } = require("../../infrastructure/services/github.service");
  const { sendReleaseNotificationEmail } = require("../../infrastructure/services/email.service");
  const { AppError } = require("../../shared/errors/app-error");
  
  const scanReleases = async () => {
	const repositories = await findAll();
  
	for (const repository of repositories) {
	  try {
		console.log("Scanning repo:", repository.fullName);
		console.log("Stored lastSeenTag:", repository.lastSeenTag);
  
		const latestRelease = await getLatestRelease(repository.fullName);
  
		console.log("Latest release:", latestRelease?.tagName);
  
		if (!latestRelease || !latestRelease.tagName) {
		  await touchLastCheckedAtById(repository._id);
		  continue;
		}
  
		if (!repository.lastSeenTag) {
		  await updateLastSeenTagById(repository._id, latestRelease.tagName);
		  continue;
		}
  
		if (repository.lastSeenTag === latestRelease.tagName) {
		  await touchLastCheckedAtById(repository._id);
		  continue;
		}
  
		const activeSubscriptions = await findActiveByRepositoryId(repository._id);
  
		console.log("Active subscriptions count:", activeSubscriptions.length);
  
		for (const subscription of activeSubscriptions) {
		  console.log("Sending release email to:", subscription.email);
  
		  await sendReleaseNotificationEmail(
			subscription.email,
			subscription.unsubscribeToken,
			repository.fullName,
			latestRelease
		  );
		}
  
		await updateLastSeenTagById(repository._id, latestRelease.tagName);
	  } catch (error) {
		if (error instanceof AppError && error.statusCode === 503) {
		  console.error(
			`Scanner paused because GitHub rate limit was reached. Retry after ${error.meta?.retryAfterSeconds || 60}s`
		  );
		  break;
		}
  
		console.error(`Failed to scan ${repository.fullName}:`, error.message);
	  }
	}
  };
  
  module.exports = {
	scanReleases,
  };