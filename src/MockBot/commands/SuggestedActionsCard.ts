import { TurnContext } from 'botbuilder-core';

const name = 'Suggested actions';

const help = () => ({
  'suggested-actions': 'Show a suggested actions demo'
});

const processor = async (context: TurnContext, arg: string) => {
  const { PUBLIC_URL } = process.env;

  if ((arg || '').toLowerCase().trim() === 'others') {
    // Related to #1057

    await context.sendActivity({
      type: 'message',
      textFormat: 'plain',
      text: 'This activity should not display any suggested actions.',
      suggestedActions: {
        actions: [{
          title: 'This button should not appear',
          type: 'imBack',
          value: 'suggested-actions this-button-should-not-appear',
        }],
        to: ['some-other-id']
      }
    });
  } else if (arg) {
    await context.sendActivity(`You submitted "${ arg.trim() }"`);
  } else {
    await context.sendActivity({
      type: 'message',
      textFormat: 'plain',
      text: 'Please select one of the actions below',
      suggestedActions: {
        actions: [
          {
            image: `${ PUBLIC_URL }assets/square-icon.png`,
            title: 'IM back as string',
            type: 'imBack',
            value: 'postback imback-string',
          },
          {
            image: `${ PUBLIC_URL }assets/square-icon-red.png`,
            title: 'Post back as string',
            type: 'postBack',
            value: 'postback postback-string',
          },
          {
            image: `${ PUBLIC_URL }assets/square-icon-green.png`,
            title: 'Post back as JSON',
            text: 'Some text',
            type: 'postBack',
            value: {
              hello: 'World!'
            },
          },
          {
            image: `${ PUBLIC_URL }assets/square-icon-purple.png`,
            displayText: 'say Hello World!',
            title: 'Message back as JSON with display text',
            text: 'Some text',
            type: 'messageBack',
            value: {
              hello: 'World!'
            },
          },
          {
            image: `${ PUBLIC_URL }assets/square-icon-purple.png`,
            title: 'Message back as JSON without display text',
            type: 'messageBack',
            value: {
              hello: 'World!'
            },
          },
          {
            displayText: 'Aloha',
            image: `${ PUBLIC_URL }assets/square-icon-purple.png`,
            text: 'echo Hello',
            title: 'Message back as string with display text',
            type: 'messageBack',

            // TODO: Remove value after bumping DLJS
            value: null
          }
        ],
        // TODO: Should we fill in the "to"?
        to: []
      }
    });
  }
};

export default {
  help,
  name,
  pattern: /^suggested\-actions(\s+[\d\w]+)?/i,
  processor
}
