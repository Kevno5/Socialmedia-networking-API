
const {Thought, User } = require('../models');

const thoughtsController = {
    getAllThoughts(req,res){
        Thought.find({})
        .populate({
            path: 'user',
            select: '-__v'
        })
        .select('-__v')
        .then(dbThoughtsData => res.json(dbThoughtsData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err)
        });
    },

    getThoughtById({ params }, res) {
        Thought.findOne({_id: params._id})
        .populate({
            path: 'user',
            select: '-__v'
        })
        .select('-__v')
        .sort({_id: -1})
        .then(dbThoughtsData => res.json(dbThoughtsData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err)
        })
    },

    createThought({ params, body}, res) {
        Thought.create({...body, _id: params.userId })
        .then(({_id}) => {
            
            return User.findOneAndUpdate(
                {username: params.userId},
                {$push: { thougths: _id}},
                {new: true}
            )
        })
        .then(dbThoughtsData => {
           
            if(!dbThoughtsData) {
                res.status(404).json({message: 'No thoughts with this id!'});
                return
            }
            res.json(dbThoughtsData)
        })
        .catch(err => res.json(err));
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
        Thoughts.findOneAndUpdate({_id: params.thoughtId}, {$push: {reactions: body}}, {new: true, runValidators: true})
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
        Thoughts.findOneAndUpdate({_id: params.thoughtId}, {$pull: {reactions: {reactionId: params.reactionId}}}, {new : true})
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