# AWS Infrastructure Setup Guide

Manual setup steps required before the CI/CD pipeline can run.

## 1. Create ECR Repository

1. Go to **Amazon ECR** > **Create repository**
2. Settings:
   - Visibility: **Private**
   - Name: `personal-portfolio`
   - Tag immutability: Disabled
   - Scan on push: Enabled
3. Note the **Repository URI** (e.g. `123456789012.dkr.ecr.us-east-1.amazonaws.com/personal-portfolio`)

## 2. Create IAM User for GitHub Actions

### 2.1 Create IAM Policy

Go to **IAM > Policies > Create policy** with this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

Name it `GitHubActions-ECR-Access`.

### 2.2 Create IAM User

1. **IAM > Users > Create user**
2. Username: `github-actions-deploy`
3. Attach policy: `GitHubActions-ECR-Access`
4. Create access keys (use case: "Application running outside AWS")
5. Save the **Access Key ID** and **Secret Access Key**

## 3. Create EC2 Instances (x3)

Repeat for dev, staging, and production:

1. **EC2 > Launch Instance**
   - Name: `personal-portfolio-dev` / `staging` / `prod`
   - AMI: **Ubuntu Server 22.04 LTS**
   - Instance type: `t2.micro` (free tier) or `t3.micro`
   - Key pair: Create or reuse — save the `.pem` file
   - Network: Auto-assign public IP **enabled**
   - Security group rules:
     - SSH (22) — your IP only
     - HTTP (80) — `0.0.0.0/0`
   - Storage: 8 GB gp3

2. Note each instance's **Public IPv4 address**

## 4. Configure Each EC2 Instance

SSH in:

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### 4.1 Install Docker

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
exit
```

SSH back in, then verify:

```bash
docker --version
```

### 4.2 Install AWS CLI

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install unzip -y
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip
```

### 4.3 Attach IAM Role for ECR Access

1. **IAM > Roles > Create role**
   - Trusted entity: AWS service > EC2
   - Attach policy: `AmazonEC2ContainerRegistryReadOnly`
   - Name: `EC2-ECR-ReadOnly`
2. For each EC2 instance: **Actions > Security > Modify IAM role** > select `EC2-ECR-ReadOnly`

### 4.4 Create App Directory

```bash
mkdir -p /home/ubuntu/personal-portfolio
cd /home/ubuntu/personal-portfolio

cat > docker-compose.yml << 'EOF'
services:
  web:
    image: ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
    container_name: personal-portfolio-${ENVIRONMENT}
    ports:
      - "${PORT:-80}:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
EOF
```

### 4.5 Test ECR Login

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_ECR_REGISTRY>
```

Should print "Login Succeeded".

## 5. GitHub Secrets

Add these in your repo: **Settings > Secrets and variables > Actions**

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_PRIVATE_KEY` | Full contents of your `.pem` file |
| `DEV_EC2_HOST` | Dev EC2 public IP |
| `STAGING_EC2_HOST` | Staging EC2 public IP |
| `PROD_EC2_HOST` | Production EC2 public IP |

## 6. Verify Setup

```bash
# Local Docker build test
docker build -t personal-portfolio:local .
docker run -p 8080:80 personal-portfolio:local
# Visit http://localhost:8080

# Push to dev branch to trigger first deployment
git checkout -b dev
git push -u origin dev
# Check GitHub Actions tab for workflow status
```
