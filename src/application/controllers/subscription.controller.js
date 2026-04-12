const { subscribeToRepo } = require("../use-cases/subscribe-to-repo");

const subscribeController = async (req, res, next) => {
  try {
    const result = await subscribeToRepo(req.body);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribeController,
};