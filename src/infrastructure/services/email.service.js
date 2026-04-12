const sendConfirmationEmail = async (email, token) => {
	const confirmLink = `http://localhost:3000/api/confirm/${token}`;
  
	console.log("Confirmation email");
	console.log(`To: ${email}`);
	console.log(`Confirm link: ${confirmLink}`);
  };
  
  module.exports = {
	sendConfirmationEmail,
  };