const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("you can only update your account");
  }
});
// delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("you can only delete your account");
  }
});
// get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});
// connect a user
router.put("/connect/:id", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId); 
      if(!user.connections.includes(req.body.userId)){
         await user.updateOne({$push:{connections: req.body.userId}})
         await currentUser.updateOne({$push:{connections: req.params.id}})
         res.status(200).json('user has been connected')
      }else{
        res.status(403).json('you are already conncected')
      }
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(404).json("you can not connect yourself");
  }
});
// follow a user
router.put("/follow/:id", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId); 
        if(!user.followers.includes(req.body.userId)){
           await user.updateOne({$push:{followers: req.body.userId}})
           await currentUser.updateOne({$push:{followings: req.params.id}})
           res.status(200).json('user has been followed')
        }else{
          res.status(403).json('you are already following')
        }
      } catch (err) {
        res.status(403).json(err);
      }
    } else {
      res.status(404).json("you can not follow yourself");
    }
  });

// unfollow user
router.put("/unfollow/:id", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId); 
        if(user.followers.includes(req.body.userId)){
           await user.updateOne({$pull:{followers: req.body.userId}})
           await currentUser.updateOne({$pull:{followings: req.params.id}})
           res.status(200).json('user is no longer followed')
        }else{
          res.status(403).json('you are not following this user')
        }
      } catch (err) {
        res.status(403).json(err);
      }
    } else {
      res.status(404).json("you can not unfollow yourself");
    }
  });
module.exports = router;
