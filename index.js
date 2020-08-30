const Telegraf = require('telegraf');
const fetch = require("node-fetch");
const Markup = require("telegraf/markup");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
const Scene = require('telegraf/scenes/wizard')
const { enter, leave } = Stage

var summarizationRes=[];
var hashtagSuggestions=[];

//bot commands


const bot = new Telegraf([Your telegram bot]) 

bot.start((ctx) =>{ ctx.reply(`Welcome ${ctx.from.first_name} ${ctx.from.last_name}`,
  Markup.inlineKeyboard([
    Markup.callbackButton("Text Sentiment Analysis", "sentiment_analysis"),
    Markup.callbackButton("Hashtags Suggestions", "hashtag_suggestion"),
    Markup.callbackButton("Article Summarization", "article_summarization")
  ]).extra()
)});


//Response handler
async function handleResponse(response){
  try {
    return (await response.json());
  }
  catch (error) {
    console.error();
  }
}

//Wizard scenes

const sentimentAnalysis= new WizardScene("sentiment_analysis",
ctx => {
  ctx.reply("Please, enter the Text to analyze its Sentiment/Polarity"); 
  return ctx.wizard.next();
},
async ctx => {
  const text = ctx.message.text;
  ctx.reply("Wait a moment")
  
  ctx.reply(await analysis(text),
    Markup.inlineKeyboard([
      Markup.callbackButton("Text Sentiment Analysis","sentiment_analysis"),
      Markup.callbackButton("Hashtags Suggestions", "hashtag_suggestion"),
      Markup.callbackButton("Article Summarization", "article_summarization")
    ]).extra(),   
  )
  .catch(err => ctx.reply(
    err.message,
    Markup.inlineKeyboard([
      Markup.callbackButton("Text Sentiment Analysis", "sentiment_analysis")
    ]).extra()
  ));
  return ctx.scene.leave();
}
);




const hashtagSuggestion= new WizardScene("hashtag_suggestion",
ctx => {
  ctx.reply("Please, Enter your Caption or Article to get Hashtag suggestions"); 
  return ctx.wizard.next();
},
async ctx => {
  const text = ctx.message.text;
  ctx.reply("Getting Hashtags suggestions")
  await getHashtags(text);
  for(var i=0;i<hashtagSuggestions.length;i++){
    await ctx.reply(hashtagSuggestions[i])
    }
    ctx.reply("End of the Result. Wanna try something again?",
    Markup.inlineKeyboard([
      Markup.callbackButton("Text Sentiment Analysis","sentiment_analysis"),
      Markup.callbackButton("Hashtags Suggestions", "hashtag_suggestions"),
      Markup.callbackButton("Article Summarization", "article_summarization")
    ]).extra(),   
  )
  .catch(err => ctx.reply(
    err.message,
    Markup.inlineKeyboard([
      Markup.callbackButton("Hashtags Suggestion", "sentiment_analysis")
    ]).extra()
  ));
  return ctx.scene.leave();
}
);




const summary= new WizardScene("article_summarization",
ctx => {
  ctx.reply("Paste the Url of a Aricle or Blog to get its summary"); 
  return ctx.wizard.next();
},
async ctx => {
  const url = ctx.message.text;
  ctx.reply("Getting Summary, Wait")
  
  await summarization(url)
  for(var i=0;i<summarizationRes.length;i++){
    await ctx.reply(summarizationRes[i])
  }
  ctx.reply("End of the Result. Wanna try something again?",
    Markup.inlineKeyboard([
      Markup.callbackButton("Text Sentiment Analysis","sentiment_analysis"),
      Markup.callbackButton("Hashtags Suggestions", "hashtag_suggestions"),
      Markup.callbackButton("Article Summarization", "article_summarization")
    ]).extra(),   
  )
  .catch(err => ctx.reply(
    err.message,
    Markup.inlineKeyboard([
      Markup.callbackButton("Article Summarization", "article_summarization")
    ]).extra()
  ));
  return ctx.scene.leave();
}
);

//




//bot commands
const stage=new Stage([sentimentAnalysis,hashtagSuggestion,summary])
bot.use(session());
bot.use(stage.middleware());
bot.action("sentiment_analysis",Stage.enter("sentiment_analysis"));
bot.action("hashtag_suggestion",Stage.enter("hashtag_suggestion"));
bot.action("article_summarization",Stage.enter("article_summarization"));


bot.launch(
    console.log("Bot is live")
)


//Functions for Api calls

//Function for text analysis

async function analysis(text){
  const response=await fetch(`https://api.aylien.com/api/v1/sentiment?text=${text}`,{
    "method": "GET",
      "headers": {
      'X-AYLIEN-TextAPI-Application-Key': [Your Alyien Api key],
      'X-AYLIEN-TextAPI-Application-ID': [Your Alyien Api Id],
      }
  })
  const data=await handleResponse(response);
  return(`Polarity: ${data.polarity}  , Polarity-Confidence: ${data.polarity_confidence}`)
}
  
//Function to get article summary

async function summarization(url){
  const response=await fetch(`https://api.aylien.com/api/v1/summarize?url=${url}`,{
    "method": "GET",
    "headers": {
      'X-AYLIEN-TextAPI-Application-Key': [Your Alyien Api key],
      'X-AYLIEN-TextAPI-Application-ID': [Your Alyien Api Id],
    }
  })
  const data=await handleResponse(response);
    summarizationRes=data.sentences;
}
    

//Function to get hashtags

async function getHashtags(text){

  const response=await fetch(`https://api.aylien.com/api/v1/hashtags?text=${text}`,{
    "method": "GET",
    "headers": {
      'X-AYLIEN-TextAPI-Application-Key': [Your Alyien Api key],
      'X-AYLIEN-TextAPI-Application-ID': [Your Alyien Api Id],
    }
  })
  const data=await handleResponse(response);
  hashtagSuggestions=data.hashtags;
}


//end
