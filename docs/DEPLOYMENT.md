# Deployment Guide

## Branch Strategy

| Branch | Environment | Trigger |
|--------|-------------|---------|
| `dev` | Dev | Push to `dev` |
| `staging` | Staging | Push to `staging` |
| `main` | Production | Push to `main` |

## Deployment Flow

```
feature branch → dev → staging → main
```

1. Create feature branch from `dev`, develop, push
2. Merge to `dev` → auto-deploys to dev EC2
3. Merge `dev` to `staging` → auto-deploys to staging EC2
4. Merge `staging` to `main` → auto-deploys to production EC2

Each deploy: build Docker image → push to ECR → SSH to EC2 → pull & restart → health check.

## Manual Trigger

Go to **GitHub Actions** tab > select workflow > **Run workflow**.

## Monitoring on EC2

```bash
ssh -i your-key.pem ubuntu@<EC2-HOST>
cd /home/ubuntu/personal-portfolio

docker ps                              # container status
docker logs personal-portfolio-dev -f  # follow logs
curl http://localhost/health            # health check
```

## Rollback

### Quick: use previous image

```bash
# On EC2
cd /home/ubuntu/personal-portfolio
docker images | grep personal-portfolio   # list available tags
# Edit .env to set IMAGE_TAG to a previous working tag
docker compose down && docker compose up -d
```

### Full: revert in git

```bash
git revert <bad-commit>
git push origin <branch>
# Auto-redeploys with the reverted code
```
