const express = require("express");
const router = express.Router();
const userObejct = {
  userName: 'Leon',
  authToken: 'faketoken1949',
  address: '五道口职业技术学院',
  age:18
};
router.get("/", (req, res) => {
  res.send(userObejct).status(200);
});

module.exports = router;