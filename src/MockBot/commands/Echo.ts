import { TurnContext } from 'botbuilder-core';
import onErrorResumeNext from 'on-error-resume-next';

const help = () => ({
  'echo Hello, World!': 'Echo back the message after deserialized as JSON',
  'echo "Hello\nWorld!"': 'Parse the message as JSON and echo back'
});

const processor = async (context: TurnContext) => {
  let { activity: { text: line }} = context;
  
  line = line.substr(5);
  const text = line[0] === '"' ? onErrorResumeNext(() => JSON.parse(line)) || '[Error while parsing the JSON]' : line;

  await context.sendActivity('Echoing back in a separate activity.');
  await context.sendActivity(text);
}

export default { 
  help,
  name: 'Echo',
  pattern: /echo\s/i, 
  processor
};