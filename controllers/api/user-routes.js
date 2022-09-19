const router = require("express").Router();
const User = require("../../models/User.js");
const Group = require("../../models/Group");

// See ALL users
router.get("/", (req, res) => {
  // This shouldn't be? Why would we ever use all the users? Also it shows password so this is a big nono.
  User.findAll().then((userData) => {
    res.json(userData);
  }); 
 });


 // This is used in navbar.js function create
// router.put("/:newGroup",(req,res) => {
//   console.log('Creating Group ',req.params.newGroup);
//   Group.findOne({
//     where: {
//       name: req.params.newGroup,
//     },
//   }).then((group) => {
//     console.log(" ->> Updating user too :",group.id);
//     User.update(
//       {
//         groupId: group.id,
//       },
//       {
//         where: {
//           id: req.session.user.id,
//         },
//       }
//     ).then(()=>{
//       req.session.save(() => {
//         req.session.user.groupId = group.id;
//         res
//           .status(200)
//           .json(Group);
//       });
//     });

//   });
// });

// See ONE user, but when do we ever see 1 user?
router.get("/:id", (req, res) => {
  User.findOne({
    where: {
      id: req.params.id,
    },
  }).then((userData) => {
    res.json(userData);
  });
});

// CREATE New User
// Currently used in login.js signupFormHandler
router.post("/", async (req, res) => {
  try {
    const createUser = await User.create({
      userName: req.body.username,
      password: req.body.password,
      longitude: req.body.longitude,
      latitude: req.body.latitude,
      //      groupId: groupID,
    });
    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.user = createUser;
      res.status(200).json(createUser);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Login User
// Currently used in login.js loginFormHandler.
router.post("/login", async (req, res) => {
  try {
    const loginUser = await User.findOne({
      where: {
        userName: req.body.userName,
      },
    });
    if (!loginUser) {
      res
        .status(400)
        .json({ message: "Incorrect email or password. Please try again!" });
      return;
    }

    const validPassword = loginUser.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Invalid login credentials. Please try again!" });
      return;
    }
//    console.log(loginUser.groupId,"GROUP ID");
    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.user = loginUser;
      res
        .status(200)
        .json({ user: loginUser, message: "You are now logged in!" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET current group id --> do we need any other info besides the group id?
// router.get("/currentGroup/:id", async (req, res) => {
//   try {
//     const currentGroupData = await User.findAll({
//       where: { id: req.params.id },
//       attributes: ["group_id"],
//     });
//     const currentGroup = currentGroupData.map((data) =>
//       data.get({ plain: true })
//     );
//     res.status(200).json(currentGroup);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });

//update user for current groupId.
// this is currently called via navbar.js function joinGroup.
router.put("/:id", (req, res) => {
  console.log("Updating user ID:",req.session.user.id,"too",  req.params.id, "Group needs to exist to join soo.");
  User.update(
    {
      groupId: req.params.id,
    },
    {
      where: {
        id: req.session.user.id,
      },
    }
  )
    .then((updatedUser) => {
      // Sends the updated user as a json response
      res.json(updatedUser);
    })
    .catch((err) => res.json(err));
});

//user LEAVING group -- req.body.groupId needs to be null
//TODO - this isn't being used, but it shouldn't require an id, the
// req.session.user.groupId is what should be set to null.
router.put("/leaveGroup/:id", async (req, res) => {
  try {
    const deleteGroupData = User.update(
      { groupId: req.body.groupId },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    //this should return empty if groupId is set to null
    res.json(deleteGroupData);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

// Currently not being used.
router.get("/allGroups/:id", async (req, res) => {
  try {
    const groupData = await Group.findAll({
      where: { id: req.params.id },
      attributes: ["id", "name"],
    });
    const allGroups = groupData.map((data) => data.get({ plain: true }));
    res.status(200).json(allGroups);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


// Logout User Called navbar.js at function logout.
router.post("/logout", (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
