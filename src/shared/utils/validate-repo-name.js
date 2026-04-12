const isValidRepoName = (repo) => {
	if (!repo || typeof repo !== "string") {
	  return false;
	}
  
	const parts = repo.split("/");
  
	if (parts.length !== 2) {
	  return false;
	}
  
	const [owner, repository] = parts;
  
	return Boolean(owner && repository);
  };
  
  module.exports = {
	isValidRepoName,
  };