# Ustream Smart Contract Repository

**This is the smart comtract github repository for the blockchain architecture
for Ustream Web3 feel free to leave any suggestions/contributions if you can
so sit back and enjoy the code.  Happy hacking 💚💜 !!**

P.S. Star ⭐ if you had fun!! 😍

<!-- # 📌 Videos:

- [Hacktoberfest Intro](https://youtu.be/OsAFX_ZbgaE)
- [How to pull request [Overview]](https://youtu.be/DIj2q02gvKs)
- [Merge Conflict / comment](https://youtu.be/zOx5PJTY8CI) -->


# Contribution Guide📚:

- You are allowed to make pull requests that break the rules. We just merge it ;)
- Try to keep pull requests small to minimize merge conflicts


## Getting Started 🤗:

- Fork this repo (button on top)
- Clone on your local machine

```
git clone https://github.com/Ustream-web3/ustream-web3-blockend.git

```
- Navigate to project directory.
```
cd ustream-web3-blockend
```

- Create a new branch

```markdown
git checkout -b my-new-branch
```
- Add your contribution
```
git add .
```
- Commit your changes.

```markdown
git commit -m "Relevant message"

```
- Then push 
```
git push origin my-new-branch
```
- Create a new pull request from your forked repository


## Avoid Conflicts (Syncing your fork)

An easy way to avoid conflicts is to add an 'upstream' for your git repo, as other PR's may be merged while you're working on your branch/fork.   

```terminal
git remote add upstream https://github.com/fineanmol/Hacktoberfest2021
```

You can verify that the new remote has been added by typing
```terminal
git remote -v
```

To pull any new changes from your parent repo simply run
```terminal
git merge upstream/master
```

This will give you any eventual conflicts and allow you to easily solve them in your repo. It's a good idea to use it frequently in between your own commits to make sure that your repo is up to date with its parent.

For more information on syncing forks [read this article from Github](https://help.github.com/articles/syncing-a-fork/).