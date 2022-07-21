
const {Thought, User } = require('../models');

const thoughtsController = {
    getAllThoughts(req,res){
        Thought.find({})
        .then(dbThoughtsData => res.json(dbThoughtsData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err)
        });
    },

    getThoughtById({ params }, res) {
        Thought.findOne({_id: params.id})
        .select('-__v')
        .sort({_id: -1})
        .then(dbThoughtsData => res.json(dbThoughtsData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err)
        })
    },

    createThought(req, res) {
        Thought.create(req.body)
          .then(({ _id }) => {
            return User.findOneAndUpdate(
              { _id: req.body.userId },
              { $push: { thoughts: _id } },
              { new: true }
            );
          })
          .then((dbUserData) => {
            if (!dbUserData) {
              return res
                .status(404)
                .json({ message: 'Thought created but no user with this id!' });
            }
    
            res.json({ message: 'Thought successfully created!' });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json(err);
          });
      },

    updateThoughts({params, body}, res){
        Thought.findOneAndUpdate(
            {_id: params.id},
            body,
            {new: true, runValidators: true}
        )
        .then(updatedThought => {
            if(!updatedThought){
                return res.status(404).json({message: 'No thoughts with this id'});
            }
            res.json(updatedThought);
        })
        .catch(err => res.json(err));
    },
    
    deleteThought({ params, body}, res) {
        Thought.findOneAndDelete({ _id: params.id })
        .then(deletedThought => {
            if (!deletedThought) {
                return res.status(404).json({ message: 'No thought with this ID!'})
            }
            res.json(deletedThought);
        })
        .catch(err => res.json(err));
    },

    addReaction({params, body}, res) {
        Thought.findOneAndUpdate({_id: params.thoughtId}, {$push: {reactions: body}}, {new: true, runValidators: true})
        .populate({path: 'reactions', select: '-__v'})
        .select('-__v')
        .then(dbThoughtsData => {
        if (!dbThoughtsData) {
            res.status(404).json({message: 'No thoughts with this particular ID!'});
            return;
        }
        res.json(dbThoughtsData);
        })
        .catch(err => res.status(400).json(err))

    },

    deleteReaction({params}, res) {
        Thought.findOneAndUpdate({_id: params.thoughtId}, {$pull: {reactions: {reactionId: params.reactionId}}}, {new : true})
        .then(dbThoughtsData => {
            if (!dbThoughtsData) {
                res.status(404).json({message: 'No thoughts with this particular ID!'});
                return;
            }
            res.json(dbThoughtsData);
        })
        .catch(err => res.status(400).json(err));
    }
};

module.exports = thoughtsController