import { Attachment, TurnContext } from 'botbuilder-core';
import fetch from 'node-fetch';

const help = () => ({
  'upload': 'Upload a file'
});

async function fetchJSON(url) {
  const res = await fetch(url);

  if (res.ok) {
    const text = await res.text();

    return JSON.parse(text);
  } else {
    throw new Error(`Server returned ${ res.status }`);
  }
}

function isTrustedAttachmentURL(url) {
  return (
    /^https:\/\/directline.botframework.com\//i.test(url) ||
    /^https:\/\/webchat.botframework.com\//i.test(url) ||
    /^https?:\/\/localhost(:\d+)?\//i.test(url)
  );
}

async function echoAttachment({ contentType, contentUrl, name }) {
  if (
    contentType === 'application/json'
    && isTrustedAttachmentURL(contentUrl)
  ) {
    // We only fetch content from trusted source, so we don't DDoS anyone.

    return {
      content: await fetchJSON(contentUrl),
      contentType: 'application/vnd.microsoft.card.adaptive',
      name
    };
  } else {
    return {
      contentType: 'application/octet-stream',
      contentUrl,
      name
    };
  }
}

const processor = async (context: TurnContext) => {
  const { activity: { attachments = [] }} = context;

  if (attachments.length) {
    await context.sendActivity({
      text: 'You have uploaded:',
      type: 'message',
      attachments: await Promise.all(attachments.map(echoAttachment))
    });
  } else {
    await context.sendActivity({
      text: 'You have uploaded no files.',
      type: 'message'
    });
  }
};

export default {
  help,
  name: 'File upload',
  pattern: /upload$/i,
  processor
}
