# CircleCI Notifications for MS Teams

A serverless service to stream CircleCI workflow notifications for Slack to a Microsoft Teams incoming webhook.

## Development

### Environment

Create a file named `.env` fill it with content as shown below:

```
WEBHOOK_URL: <Microsoft Teams Incoming Webhook URL>
```

### Server

Run the server with the command below with (auto-reload and auto-compilation enabled):

```shell
yarn dev
```

## Deployment

Before deployment, make sure you have created a `SecureString` parameter with the key `/circleci-teams-notifications/WEBHOOK_URL` in Parameter Store of AWS System Manager.
The value of the parameter should be the `WEBHOOK_URL` for Teams.

```shell
yarn serverless deploy --stage prod
```
