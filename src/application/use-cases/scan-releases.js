const {
	findAll,
	updateLastSeenTagById,
	touchLastCheckedAtById,
  } = require("../../infrastructure/repositories/github-repository.repository.impl");
  const { findActiveByRepositoryId } = require("../../infrastructure/repositories/subscription.repository.impl");
  const { getLatestRelease } = require("../../infrastructure/services/github.service");
  const { sendReleaseNotificationEmail } = require("../../infrastructure/services/email.service");
  
  const scanReleases = async () => {
	const repositories = await findAll();
  
	for (const repository of repositories) {
	  const latestRelease = await getLatestRelease(repository.fullName);
  
	  if (!latestRelease) {
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
  
	  for (const subscription of activeSubscriptions) {
		await sendReleaseNotificationEmail(
		  subscription.email,
		  subscription.unsubscribeToken,
		  repository.fullName,
		  latestRelease
		);
	  }
  
	  await updateLastSeenTagById(repository._id, latestRelease.tagName);
	}
  };
  
  module.exports = {
	scanReleases,
  };