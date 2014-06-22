"use strict";

var proxyquire = require('proxyquire'),
    should = require('chai').should(),
    sinon = require('sinon'),
    q = require('q'),
    _ = require('lodash'),
    gameRepository = require(_setup.getRepositoryPath('gameRepository'));

describe('Game Repository', function(){
    var repo;

    beforeEach(function(){
        repo = gameRepository();
    });
    afterEach(function(){
    });

    var getRepoWithStubbedRandomstring = function(stub){
        return proxyquire(
            _setup.getRepositoryPath('gameRepository'),
            {
                'randomstring': stub
            }
        )();
    };

    it('should generate an id when creating a game', function () {
        return repo.createGame().then( function(game){
            game.should.have.property('id').that.is.a('string');
        });
    });

    it('should generate a unique id when creating a game', function() {
        var randomstringStub = {};
        // Simulate the off chance that we get the same generated id for two different games
        var firstString = 'abcdef';
        var secondString = '123456';
        randomstringStub.generate = sinon.stub();
        randomstringStub.generate.onFirstCall().returns(firstString);
        randomstringStub.generate.onSecondCall().returns(firstString);
        randomstringStub.generate.onThirdCall().returns(secondString);

        repo = getRepoWithStubbedRandomstring(randomstringStub);

        return repo.createGame().then( function(firstGame){
            return repo.createGame()
            .then( function(){
                console.log(repo.games);
                return repo.getGame(firstString)
                .then(function(retrievedGame){
                    randomstringStub.generate.should.have.been.calledThrice;
                    retrievedGame.should.equal(firstGame);
                });
            });
        });
    });

    it('should reject if adding user to game that does not exist', function(){
        return repo.addUserToGame({gameId: 'invalid', userId: 'validId1', userInfo:{}}).should.be.rejected;
    });

    describe('with game', function(){
        var gameId = null;
        beforeEach(function () {
            return repo.createGame().then(function(createdGame){gameId = createdGame.id;});
        });

        var getGame = function() {
            return repo.getGame(gameId);
        };

        var getUser = function(game){
            return _.find(game.players, {id: userId});
        };

        var userId = 'validId1';
        var userInfo = {id: userId, name: 'user1'};
        var addUser = function(){
            return repo.addUserToGame(gameId, userInfo);
        };

        it('should allow retrieving a game record by id', function(){
            return getGame()
            .then(function(returnedGame){
                returnedGame.should.not.be.undefined;
            });
        });

        it('should reject when retrieving non-existent game', function(){
            return repo.getGame('invalidId').should.be.rejected;
        });

        it('should resolve if adding user to game that exists', function(){
            return addUser();
        });

        it('should correctly add new users to game record', function () {
            return addUser()
            .then(getGame)
            .then(getUser)
            .then(function(user){
                user.should.exist;
            });
        });

        it('should not allow a user with the same id to be added twice', function () {
            return addUser()
            .then(function(){
                return addUser().should.be.rejected;
            })
        });

        it('should set player state to active when they join a game', function() {
            return addUser()
            .then(getGame)
            .then(getUser)
            .then(function(user){
                user.active.should.be.true;
            });
        });

        it('should set player state to inactive when they leave a game', function () {
            return addUser()
            .then(function(){
                repo.removeUserFromGame(gameId, userId)
                .then(getGame)
                .then(getUser)
                .then(function(user){
                    user.active.should.be.false;
                });
            })
        });

        it('should resolve with correct:false when a question is answered incorrectly', function () {
            return repo.answerCurrentQuestion(gameId, 'incorrectAnswer')
            .then(function (result) {
                result.correct.should.be.false
            });
        });

        var answerCorrectly = function(){
            return getGame().then(function(game){
                return repo.answerCurrentQuestion(gameId, userId, game.currentQuestion.answer)
            });
        };

        it('should resolve with correct:true when a question is answered correctly', function(){
            return answerCorrectly()
            .then(function(result){
                result.correct.should.be.true;
            });
        });

        it('should add the current question to the questions list when it has been answered', function(){
            return answerCorrectly()
            .then( getGame )
            .then( function(game){
                game.questions[game.questions.length-1].should.deep.equal(game.currentQuestion);
            })
        });

        it('should return an updated question when a correct answer is received', function(){
            return answerCorrectly()
            .then(function(result){
                getGame().then(function(game){
                    result.updatedQuestion.should.match({
                        winner: userId,
                        hasBeenAnswered: true,
                        answer: game.currentQuestion.answer
                    })
                });
            });
        });

        it('should should mark the current question as answered when processing a correct answer', function(){
            return answerCorrectly()
            .then( getGame )
            .then( function(game){
                game.currentQuestion.hasBeenAnswered.should.be.true;
                game.currentQuestion.winner.should.equal(userId);
            })
        });

        it('should reject incorrect answers if the question has already been answered', function () {
            return answerCorrectly()
            .then( function(){
                return repo.answerCurrentQuestion(gameId, 'someAnswer').should.be.rejected;
            })
        });

        it('should reject correct answers if the question has already been answered', function () {
            return answerCorrectly()
            .then( function(){
                return answerCorrectly().should.be.rejected;
            })
        });

    });

});