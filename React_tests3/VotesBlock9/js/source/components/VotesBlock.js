﻿"use strict";

var React = require('react');
var EventEmitter = require('events').EventEmitter;

var VoteAnswer = require('./VoteAnswer');
var voteEvents = require('../VoteEvents');

class VotesBlock extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      info:this.props.info, // массив вариантов ответа - код, текст, счётчик, признак свободного ввода
      showMode:this.props.showMode, // режим отображения - 1=результаты 2=голосование
      selectedAnswer:2, // код ответа, который сейчас выбран
      };
  }

  answerChanged(answerCode) {
    this.setState({selectedAnswer:answerCode});
  };

  componentDidMount() {
    voteEvents.addListener('AnswerChanged',this.answerChanged.bind(this));
  }

  componentWillUnmount() {
    voteEvents.removeListener('AnswerChanged',this.answerChanged.bind(this));
  }

  registerVote() {
    this.state.info.answers.forEach(v=>
      { if ( v.code==this.state.selectedAnswer ) v.count++; }
    );
    this.setState({showMode:1});
  }

  render(){
    var answersCode=this.state.info.answers.map(v=>
      <VoteAnswer key={v.code} 
        code={v.code} text={v.text} freeinput={v.freeinput} count={v.count} 
        selected={v.code==this.state.selectedAnswer}
        showMode={this.state.showMode} />
    );
    var buttonCode=(this.state.showMode==2)
      ?
        <input type='submit' value='голосовать!' style={{margin:'2px 0 5px 0'}} onClick={this.registerVote} />
      :
        null
      ;
    return (
      <div className="VotesBlock">
        <div className="Question">{this.state.info.question}</div>
        <div className="Answers">{answersCode}</div>
        {buttonCode}
      </div>
      );

  }

}

module.exports = VotesBlock;
