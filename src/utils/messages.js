// Date time :: getDate, getTime, setDate and so on...
// getTime gives a positive number starting from 1 which depicts the time after 1970
// if we try to access before 1970 in JS than it would gives a negative number

const generateMessage = (username, text) => {
  return {
    username: username,
    text: text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (username, url) => {
  return {
    username: username,
    url: url,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage,
};
