import { TurnContext } from 'botbuilder-core';

const help = () => ({
  'input-hint accepting': 'Send an activity with input hint set to "accepting input"',
  'input-hint expecting': 'Send an activity with input hint set to "expecting input"',
  'input-hint ignoring': 'Send an activity with input hint set to "ignoring input"'
});

async function sendInputHint({ adapter, activity }: TurnContext, inputHint) {
  const conversationReference = TurnContext.getConversationReference(activity);

  await adapter.continueConversation(conversationReference, async context => {
    switch ((inputHint || '').trim().substr(0, 1)) {
      case 'a':
        await context.sendActivity({
          inputHint: 'acceptingInput',
          text: 'This activity is accepting input.',
          type: 'message'
        });

        break;

      case 'e':
        await context.sendActivity({
          inputHint: 'expectingInput',
          text: 'This activity is expecting input.\n\nIt should start the microphone if it was from a microphone.',
          type: 'message'
        });

        break;

      default:
        await context.sendActivity({
          inputHint: 'ignoringInput',
          text: 'This activity is ignoring input.\n\nIt should not start the microphone.',
          type: 'message'
        });

        break;
    }
  });
}

async function processor(context: TurnContext, { args }: { args: string }) {
  const inputHints = args.split(' ');
  (async function(context) {
    // This loop is intentionally executed in a serial manner (instead of using Promise.all for parallelism)
    while (inputHints.length) {
      const inputHint = inputHints.shift();

      inputHint && (await sendInputHint(context, inputHint));
    }
  })(context);
}

export default {
  help,
  name: 'Input hint',
  pattern: /^input[\-\s]hint(\s+[\d\w]+)?(\s+[\d\w]+)?|^hint(\s+[\d\w]+)?(\s+[\d\w]+)?/i,
  processor
};
