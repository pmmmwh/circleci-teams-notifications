import got from 'got';
import he from 'he';
import escapes = require('markdown-escapes');

const { WEBHOOK_URL } = process.env;

interface LambdaResponse {
  statusCode: number;
  body: string;
}

/* A RegExp pattern to match Slack's special link format */
const linkRegex = /<(https?:\/\/)(.*?)\|(.*?)>/g;

const escapeMarkdown = (str: string): string => {
  let escapedString = str;
  escapes.gfm.forEach((token: string) => {
    escapedString = escapedString.replace(token, '\\' + token);
  });
  return escapedString;
};

const stripQueries = (href: string): string => href.split('?')[0];

const parseLinks = (str: string): string =>
  str.replace(
    linkRegex,
    (_, protocol: string, href: string, label: string) =>
      `[${label}](${protocol}${stripQueries(href)})`
  );

const linkInfoToMarkdown = ({ label, link }: { label: string; link: string }): string =>
  `[${label}](${link})`;

const createResponse = (statusCode: number, message?: unknown): LambdaResponse => ({
  statusCode,
  body: JSON.stringify({ message, status: statusCode >= 400 ? 'error' : 'ok' }, null, 2),
});

module.exports.notify = async (event: any): Promise<LambdaResponse> => {
  if (!WEBHOOK_URL) {
    return createResponse(500, 'WEBHOOK_URL not set!');
  }

  try {
    const { color = '', text = '' } = (JSON.parse(event.body)?.attachments ?? [])[0] ?? {};
    const [mainMessage, commitLog, failedJobs]: [string, string, string?] = text
      .split('\n')
      .filter(Boolean);

    const eventSummary: string = (mainMessage.match(/^(Success|Failed):(.*?) workflow/) ?? [])[0];
    const [pipelineLink, projectLink, branchLink] = (mainMessage.match(linkRegex) ?? []).map(
      (str: string) => {
        const [, protocol, href, label]: string[] = [...he.decode(str).matchAll(linkRegex)][0];
        return {
          label: escapeMarkdown(label),
          link: `${protocol}${stripQueries(href)}`,
        };
      }
    );

    const msMessageCardContent = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: color.replace(/^#/, ''),
      summary: `${eventSummary} (${pipelineLink.label})`,
      sections: [
        {
          activityTitle: `${eventSummary} (${pipelineLink.label})`,
          facts: [
            {
              name: 'Project',
              value: linkInfoToMarkdown(projectLink),
            },
            {
              name: 'Branch',
              value: branchLink.label,
            },
            {
              name: 'Commit',
              value: parseLinks(commitLog.replace('- ', '')),
            },
          ],
          text: failedJobs && parseLinks(failedJobs),
          markdown: true,
        },
      ],
      potentialAction: [
        {
          '@type': 'OpenUri',
          name: 'View in CircleCI',
          targets: [
            {
              os: 'default',
              uri: pipelineLink.link,
            },
          ],
        },
      ],
    };

    console.info('CircleCI Input', JSON.parse(event.body)?.attachments[0]);
    console.info('Parsed Output', msMessageCardContent);

    await got.post({
      url: WEBHOOK_URL,
      json: msMessageCardContent,
    });

    return createResponse(200, msMessageCardContent);
  } catch (error) {
    console.error(error);
    return createResponse(500, error.message);
  }
};
