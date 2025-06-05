// lib/github.js
const { Octokit } = require('@octokit/rest')
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

async function getPackageJson (repoName) {
  const { data } = await octokit.repos.getContent({
    owner: process.env.GITHUB_OWNER,
    repo: repoName,
    path: 'package.json'
  })
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return JSON.parse(content)
}

module.exports = { getPackageJson }
