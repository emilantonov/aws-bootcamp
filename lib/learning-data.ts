export interface Exercise {
  title: string;
  description: string;
  codeSnippet?: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Resource {
  title: string;
  url: string;
  type: "docs" | "video" | "tutorial";
}

export interface DayContent {
  day: number;
  week: number;
  service: string;
  icon: string;
  tagline: string;
  duration: string;
  category: "compute" | "storage" | "database" | "networking" | "monitoring" | "security" | "messaging" | "iac";
  objectives: string[];
  concepts: string[];
  exercise: Exercise;
  bonusChallenge?: string;
  resources: Resource[];
}

export const learningPath: DayContent[] = [
  // WEEK 1: Core Infrastructure
  {
    day: 1,
    week: 1,
    service: "Amazon EC2",
    icon: "🖥️",
    tagline: "Your first cloud server awaits!",
    duration: "3 hours",
    category: "compute",
    objectives: [
      "Understand EC2 instance types and pricing models",
      "Launch and connect to an EC2 instance",
      "Configure security groups and key pairs",
      "Deploy a simple Node.js/Express API"
    ],
    concepts: [
      "Instance Types (t2.micro, t3.small, etc.)",
      "AMIs (Amazon Machine Images)",
      "Security Groups (Virtual Firewalls)",
      "Elastic IPs",
      "Key Pairs for SSH access"
    ],
    exercise: {
      title: "Deploy the Joke API",
      description: "Launch an EC2 instance, install Node.js, and deploy a simple Express API that returns random programming jokes. Test it with curl from your local machine!",
      codeSnippet: `// joke-api/index.js
const express = require('express');
const app = express();

const jokes = [
  "Why do programmers prefer dark mode? Because light attracts bugs!",
  "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
  "There are only 10 types of people in the world: those who understand binary and those who don't.",
  "Why did the developer go broke? Because he used up all his cache!"
];

app.get('/api/joke', (req, res) => {
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  res.json({ joke: randomJoke, timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(3000, () => console.log('Joke API running on port 3000'));`,
      difficulty: "easy"
    },
    bonusChallenge: `Set up a cron job that restarts the API if it crashes! \r\n
For curl testing you need to add a security group rule to allow inbound traffic Type Custom TCP, Port 3000, Source 0.0.0.0/0.`,
    resources: [
      { title: "EC2 Getting Started Guide", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html", type: "docs" },
      { title: "EC2 Instance Types", url: "https://aws.amazon.com/ec2/instance-types/", type: "docs" }
    ]
  },
  {
    day: 2,
    week: 1,
    service: "Amazon S3",
    icon: "🪣",
    tagline: "Infinite storage in the cloud!",
    duration: "3 hours",
    category: "storage",
    objectives: [
      "Create and configure S3 buckets",
      "Understand storage classes and lifecycle policies",
      "Implement file uploads via AWS SDK",
      "Set up bucket policies and CORS"
    ],
    concepts: [
      "Buckets and Objects",
      "Storage Classes (Standard, IA, Glacier)",
      "Bucket Policies vs ACLs",
      "Pre-signed URLs",
      "Versioning and Lifecycle Rules"
    ],
    exercise: {
      title: "Build a Meme Storage Service",
      description: "Create an API endpoint that accepts image uploads and stores them in S3. Return a pre-signed URL for viewing the uploaded meme!",
      codeSnippet: `// Add to your Joke API
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({ region: 'us-east-1' });
const BUCKET = 'your-meme-bucket';

app.post('/api/meme', upload.single('image'), async (req, res) => {
  const key = \`memes/\${Date.now()}-\${req.file.originalname}\`;
  
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  }));

  const viewUrl = await getSignedUrl(s3, 
    new GetObjectCommand({ Bucket: BUCKET, Key: key }), 
    { expiresIn: 3600 }
  );

  res.json({ message: 'Meme uploaded!', key, viewUrl });
});`,
      difficulty: "medium"
    },
    bonusChallenge: "Add a lifecycle rule to move memes older than 30 days to Glacier!",
    resources: [
      { title: "S3 User Guide", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html", type: "docs" },
      { title: "AWS SDK for JavaScript v3", url: "https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/", type: "docs" }
    ]
  },
  {
    day: 3,
    week: 1,
    service: "AWS Lambda",
    icon: "⚡",
    tagline: "Serverless magic - no servers to manage!",
    duration: "3 hours",
    category: "compute",
    objectives: [
      "Understand serverless architecture and cold starts",
      "Create and deploy Lambda functions",
      "Configure triggers and API Gateway",
      "Handle environment variables and layers"
    ],
    concepts: [
      "Event-driven architecture",
      "Cold starts vs warm invocations",
      "Lambda Layers for dependencies",
      "Execution roles and permissions",
      "Concurrency and throttling"
    ],
    exercise: {
      title: "Serverless Joke Generator",
      description: "Migrate the Joke API to a Lambda function! Create an API Gateway to expose it. Compare cold start times with different memory configurations.",
      codeSnippet: `// lambda/joke-handler.js
const jokes = [
  "Why do programmers prefer dark mode? Because light attracts bugs!",
  "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
  "There are only 10 types of people in the world: those who understand binary and those who don't."
];

export const handler = async (event) => {
  console.log('Event received:', JSON.stringify(event));
  
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      joke: randomJoke,
      timestamp: new Date().toISOString(),
      coldStart: !global.isWarm,
      memoryUsed: process.memoryUsage().heapUsed
    })
  };
  
  global.isWarm = true;
};`,
      difficulty: "medium"
    },
    bonusChallenge: "Add a Lambda Layer with the AWS SDK and measure the impact on cold starts!",
    resources: [
      { title: "Lambda Developer Guide", url: "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html", type: "docs" },
      { title: "API Gateway Integration", url: "https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html", type: "docs" }
    ]
  },
  {
    day: 4,
    week: 1,
    service: "Amazon API Gateway",
    icon: "🚪",
    tagline: "The front door to your cloud APIs!",
    duration: "3 hours",
    category: "networking",
    objectives: [
      "Understand REST vs HTTP APIs",
      "Create API Gateway endpoints",
      "Configure routes, methods, and integrations",
      "Set up request/response transformations",
      "Implement throttling and usage plans"
    ],
    concepts: [
      "REST API vs HTTP API (costs & features)",
      "Stages and deployments",
      "Request/Response mapping templates",
      "Authorizers (Lambda, Cognito, IAM)",
      "Throttling, quotas, and usage plans",
      "CORS configuration"
    ],
    exercise: {
      title: "Build a Professional API Gateway",
      description: "Create an HTTP API that fronts your Lambda Joke API! Add multiple routes, configure CORS, and set up request validation.",
      codeSnippet: `// API Gateway HTTP API with Lambda Integration
// Using AWS Console or IaC - here's the Terraform version:

resource "aws_apigatewayv2_api" "joke_api" {
  name          = "joke-api"
  protocol_type = "HTTP"
  
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.joke_api.id
  name        = "$default"
  auto_deploy = true
  
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      responseLength = "$context.responseLength"
      latency        = "$context.integrationLatency"
    })
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id             = aws_apigatewayv2_api.joke_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.joke_handler.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

// Routes
resource "aws_apigatewayv2_route" "get_joke" {
  api_id    = aws_apigatewayv2_api.joke_api.id
  route_key = "GET /api/joke"
  target    = "integrations/\${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "post_joke" {
  api_id    = aws_apigatewayv2_api.joke_api.id
  route_key = "POST /api/jokes"
  target    = "integrations/\${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.cognito.id
}

// JWT Authorizer (will use in Cognito day!)
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.joke_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"
  
  jwt_configuration {
    audience = [aws_cognito_user_pool_client.client.id]
    issuer   = "https://cognito-idp.us-east-1.amazonaws.com/\${aws_cognito_user_pool.pool.id}"
  }
}

// Test your API:
// curl https://your-api-id.execute-api.us-east-1.amazonaws.com/api/joke`,
      difficulty: "medium"
    },
    bonusChallenge: "Add request validation using API Gateway models and set up a usage plan with API keys!",
    resources: [
      { title: "API Gateway Developer Guide", url: "https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html", type: "docs" },
      { title: "HTTP API vs REST API", url: "https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html", type: "docs" },
      { title: "API Gateway Pricing", url: "https://aws.amazon.com/api-gateway/pricing/", type: "docs" }
    ]
  },
  {
    day: 5,
    week: 1,
    service: "Amazon RDS",
    icon: "🐘",
    tagline: "Managed databases that scale!",
    duration: "3 hours",
    category: "database",
    objectives: [
      "Set up a PostgreSQL RDS instance",
      "Configure security groups for database access",
      "Connect from Lambda/EC2",
      "Understand backups and multi-AZ deployments"
    ],
    concepts: [
      "Database engines (PostgreSQL, MySQL, etc.)",
      "Instance classes and storage types",
      "Parameter groups",
      "Automated backups and snapshots",
      "Multi-AZ vs Read Replicas"
    ],
    exercise: {
      title: "Joke Rating Database",
      description: "Create an RDS PostgreSQL database to store jokes and their ratings. Add endpoints to submit jokes and rate them!",
      codeSnippet: `// First, create the table in RDS:
// CREATE TABLE jokes (
//   id SERIAL PRIMARY KEY,
//   text TEXT NOT NULL,
//   rating DECIMAL(3,2) DEFAULT 0,
//   vote_count INT DEFAULT 0,
//   created_at TIMESTAMP DEFAULT NOW()
// );

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.RDS_HOST,
  database: process.env.RDS_DATABASE,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

app.post('/api/jokes', async (req, res) => {
  const { text } = req.body;
  const result = await pool.query(
    'INSERT INTO jokes (text) VALUES ($1) RETURNING *',
    [text]
  );
  res.json(result.rows[0]);
});

app.post('/api/jokes/:id/rate', async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body; // 1-5 stars
  
  const result = await pool.query(\`
    UPDATE jokes 
    SET rating = (rating * vote_count + $1) / (vote_count + 1),
        vote_count = vote_count + 1
    WHERE id = $2 
    RETURNING *
  \`, [rating, id]);
  
  res.json(result.rows[0]);
});`,
      difficulty: "medium"
    },
    bonusChallenge: "Enable automated backups and test restoring from a snapshot!",
    resources: [
      { title: "RDS User Guide", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html", type: "docs" },
      { title: "RDS PostgreSQL", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html", type: "docs" }
    ]
  },
  {
    day: 6,
    week: 1,
    service: "Amazon DynamoDB",
    icon: "⚡",
    tagline: "NoSQL at any scale!",
    duration: "3 hours",
    category: "database",
    objectives: [
      "Understand key-value and document models",
      "Design tables with partition and sort keys",
      "Implement CRUD operations",
      "Learn about capacity modes and indexes"
    ],
    concepts: [
      "Partition Key and Sort Key design",
      "On-Demand vs Provisioned Capacity",
      "Global Secondary Indexes (GSI)",
      "DynamoDB Streams",
      "Single Table Design patterns"
    ],
    exercise: {
      title: "Joke Leaderboard",
      description: "Create a DynamoDB table to track joke views and build a real-time leaderboard! Use GSIs to query top jokes by category.",
      codeSnippet: `const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = 'JokeLeaderboard';

// Record a joke view
app.post('/api/jokes/:id/view', async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;
  
  await docClient.send(new UpdateCommand({
    TableName: TABLE,
    Key: { PK: \`JOKE#\${id}\`, SK: 'STATS' },
    UpdateExpression: 'ADD viewCount :inc SET category = :cat, updatedAt = :now',
    ExpressionAttributeValues: {
      ':inc': 1,
      ':cat': category,
      ':now': new Date().toISOString()
    }
  }));
  
  res.json({ message: 'View recorded!' });
});

// Get top jokes (requires GSI on viewCount)
app.get('/api/leaderboard/:category', async (req, res) => {
  const { category } = req.params;
  
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'CategoryViewsIndex',
    KeyConditionExpression: 'category = :cat',
    ExpressionAttributeValues: { ':cat': category },
    ScanIndexForward: false, // Descending order
    Limit: 10
  }));
  
  res.json(result.Items);
});`,
      difficulty: "hard"
    },
    bonusChallenge: "Enable DynamoDB Streams and create a Lambda to update aggregate stats!",
    resources: [
      { title: "DynamoDB Developer Guide", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html", type: "docs" },
      { title: "DynamoDB Best Practices", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html", type: "docs" }
    ]
  },
  {
    day: 7,
    week: 1,
    service: "Amazon CloudWatch",
    icon: "📊",
    tagline: "See everything in your cloud!",
    duration: "3 hours",
    category: "monitoring",
    objectives: [
      "Set up custom metrics and dashboards",
      "Configure alarms and notifications",
      "Analyze logs with CloudWatch Insights",
      "Create metric filters from logs"
    ],
    concepts: [
      "Metrics, Dimensions, and Namespaces",
      "Log Groups and Log Streams",
      "CloudWatch Alarms and Actions",
      "CloudWatch Insights query language",
      "Custom Metrics via SDK"
    ],
    exercise: {
      title: "Joke API Observatory",
      description: "Add comprehensive monitoring to your API! Create custom metrics for joke ratings, set up alarms for error rates, and build a dashboard.",
      codeSnippet: `const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');

const cloudwatch = new CloudWatchClient({ region: 'us-east-1' });

// Middleware to track request metrics
app.use(async (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    
    await cloudwatch.send(new PutMetricDataCommand({
      Namespace: 'JokeAPI',
      MetricData: [
        {
          MetricName: 'RequestDuration',
          Value: duration,
          Unit: 'Milliseconds',
          Dimensions: [
            { Name: 'Endpoint', Value: req.path },
            { Name: 'Method', Value: req.method }
          ]
        },
        {
          MetricName: 'RequestCount',
          Value: 1,
          Unit: 'Count',
          Dimensions: [
            { Name: 'StatusCode', Value: String(res.statusCode) }
          ]
        }
      ]
    }));
  });
  
  next();
});

// Track joke ratings as custom metrics
app.post('/api/jokes/:id/rate', async (req, res) => {
  // ... existing rating logic ...
  
  await cloudwatch.send(new PutMetricDataCommand({
    Namespace: 'JokeAPI',
    MetricData: [{
      MetricName: 'JokeRating',
      Value: req.body.rating,
      Unit: 'None',
      Dimensions: [{ Name: 'JokeId', Value: req.params.id }]
    }]
  }));
});`,
      difficulty: "medium"
    },
    bonusChallenge: "Set up an alarm that triggers when error rate exceeds 5% and sends an SNS notification!",
    resources: [
      { title: "CloudWatch User Guide", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html", type: "docs" },
      { title: "CloudWatch Logs Insights", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html", type: "docs" }
    ]
  },
  {
    day: 8,
    week: 2,
    service: "Weekend Challenge",
    icon: "🏆",
    tagline: "Put it all together!",
    duration: "3 hours",
    category: "compute",
    objectives: [
      "Review Week 1 concepts",
      "Build an integrated mini-project",
      "Practice troubleshooting",
      "Prepare for Week 2"
    ],
    concepts: [
      "Architecture review",
      "Cost optimization basics",
      "Security best practices",
      "Service integration patterns"
    ],
    exercise: {
      title: "The Ultimate Joke Machine",
      description: "Combine everything from Week 1! Create a serverless API (Lambda) that stores jokes in DynamoDB, images in S3, logs metrics to CloudWatch, and has a backup in RDS for analytics.",
      codeSnippet: `// Architecture Overview:
// 
// ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
// │ API Gateway │────▶│   Lambda    │────▶│  DynamoDB   │
// └─────────────┘     └──────┬──────┘     └─────────────┘
//                            │
//         ┌──────────────────┼──────────────────┐
//         ▼                  ▼                  ▼
//   ┌─────────┐       ┌───────────┐      ┌─────────┐
//   │   S3    │       │CloudWatch │      │   RDS   │
//   │ (images)│       │ (metrics) │      │(backup) │
//   └─────────┘       └───────────┘      └─────────┘
//
// Challenge: Implement this architecture!
// 
// Endpoints:
// POST /jokes - Create joke (store in DynamoDB, replicate to RDS)
// POST /jokes/:id/image - Upload joke image to S3
// GET /jokes/:id - Get joke with view count
// GET /leaderboard - Top 10 jokes
//
// Monitoring:
// - Custom metrics for all operations
// - CloudWatch dashboard showing request rates
// - Alarm for error rate > 5%`,
      difficulty: "hard"
    },
    bonusChallenge: "Estimate your monthly AWS costs for this architecture with 10,000 daily users!",
    resources: [
      { title: "AWS Well-Architected", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", type: "docs" },
      { title: "AWS Pricing Calculator", url: "https://calculator.aws/", type: "tutorial" }
    ]
  },
  // WEEK 2: Advanced Services & IaC
  {
    day: 9,
    week: 2,
    service: "Amazon CloudFront",
    icon: "🌐",
    tagline: "CDN that makes your app fly!",
    duration: "3 hours",
    category: "networking",
    objectives: [
      "Set up a CloudFront distribution",
      "Configure origins (S3 and API Gateway)",
      "Implement caching strategies",
      "Set up custom domains with HTTPS"
    ],
    concepts: [
      "Edge Locations and PoPs",
      "Origin Access Identity (OAI)",
      "Cache behaviors and TTLs",
      "Invalidations",
      "Lambda@Edge"
    ],
    exercise: {
      title: "Global Meme Delivery Network",
      description: "Put your S3 meme bucket behind CloudFront! Configure different cache behaviors for images vs API responses.",
      codeSnippet: `// CloudFront Configuration (via console or IaC)
// 
// Distribution Settings:
// - Origin 1: S3 bucket (your-meme-bucket)
//   - Origin Access Identity: Create new OAI
//   - Cache Policy: CachingOptimized (for images)
//
// - Origin 2: API Gateway endpoint
//   - Cache Policy: CachingDisabled (for API)
//   - Origin Request Policy: AllViewer
//
// Behaviors:
// - /images/* → S3 Origin (Cache 1 year)
// - /api/* → API Gateway (No cache)
// - Default → S3 Origin

// Test CDN performance from different locations:
const testCDN = async () => {
  const cdnUrl = 'https://d1234567890.cloudfront.net';
  
  console.time('CDN Request');
  const response = await fetch(\`\${cdnUrl}/images/meme.jpg\`);
  console.timeEnd('CDN Request');
  
  // Check headers for cache status
  console.log('X-Cache:', response.headers.get('x-cache'));
  console.log('Age:', response.headers.get('age'));
};

// Invalidate cache when content updates
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');

const cloudfront = new CloudFrontClient({ region: 'us-east-1' });

const invalidateCache = async (paths) => {
  await cloudfront.send(new CreateInvalidationCommand({
    DistributionId: 'YOUR_DISTRIBUTION_ID',
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: { Quantity: paths.length, Items: paths }
    }
  }));
};`,
      difficulty: "medium"
    },
    bonusChallenge: "Use Lambda@Edge to add watermarks to images on-the-fly!",
    resources: [
      { title: "CloudFront Developer Guide", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html", type: "docs" },
      { title: "CloudFront Caching", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/ConfiguringCaching.html", type: "docs" }
    ]
  },
  {
    day: 10,
    week: 2,
    service: "Amazon Cognito",
    icon: "🔐",
    tagline: "User authentication made easy!",
    duration: "3 hours",
    category: "security",
    objectives: [
      "Create a Cognito User Pool",
      "Implement sign-up and sign-in flows",
      "Configure JWT validation",
      "Add social identity providers"
    ],
    concepts: [
      "User Pools vs Identity Pools",
      "App Clients and Hosted UI",
      "JWT tokens (ID, Access, Refresh)",
      "MFA and password policies",
      "Pre/Post authentication triggers"
    ],
    exercise: {
      title: "Secure the Joke API",
      description: "Add authentication to your API! Only authenticated users can submit jokes, but anyone can view them. Track which user submitted each joke.",
      codeSnippet: `const { CognitoJwtVerifier } = require('aws-jwt-verify');

// Create JWT verifier for your User Pool
const verifier = CognitoJwtVerifier.create({
  userPoolId: 'us-east-1_xxxxx',
  tokenUse: 'access',
  clientId: 'your-app-client-id'
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const payload = await verifier.verify(token);
    req.user = {
      id: payload.sub,
      username: payload.username,
      email: payload.email
    };
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected endpoint - only authenticated users can submit
app.post('/api/jokes', authenticate, async (req, res) => {
  const joke = {
    id: crypto.randomUUID(),
    text: req.body.text,
    authorId: req.user.id,
    authorName: req.user.username,
    createdAt: new Date().toISOString()
  };
  
  // Save to DynamoDB with author info
  await docClient.send(new PutCommand({
    TableName: 'Jokes',
    Item: joke
  }));
  
  res.json(joke);
});

// Public endpoint - anyone can view
app.get('/api/jokes', async (req, res) => {
  // ... fetch jokes ...
});`,
      difficulty: "medium"
    },
    bonusChallenge: "Add Google OAuth as a social identity provider!",
    resources: [
      { title: "Cognito Developer Guide", url: "https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html", type: "docs" },
      { title: "aws-jwt-verify", url: "https://github.com/awslabs/aws-jwt-verify", type: "docs" }
    ]
  },
  {
    day: 11,
    week: 2,
    service: "Amazon SNS",
    icon: "📢",
    tagline: "Push notifications at scale!",
    duration: "3 hours",
    category: "messaging",
    objectives: [
      "Create SNS topics and subscriptions",
      "Implement pub/sub patterns",
      "Send SMS and email notifications",
      "Fan-out to multiple subscribers"
    ],
    concepts: [
      "Topics and Subscriptions",
      "Message filtering",
      "Fan-out architecture",
      "Mobile push notifications",
      "SNS + SQS integration"
    ],
    exercise: {
      title: "Joke of the Day Notifications",
      description: "Build a notification system! Users can subscribe to daily joke notifications via email or SMS. Admins can publish the joke of the day.",
      codeSnippet: `const { SNSClient, PublishCommand, SubscribeCommand } = require('@aws-sdk/client-sns');

const sns = new SNSClient({ region: 'us-east-1' });
const TOPIC_ARN = 'arn:aws:sns:us-east-1:123456789:JokeOfTheDay';

// Subscribe user to notifications
app.post('/api/subscribe', authenticate, async (req, res) => {
  const { endpoint, protocol } = req.body; // email or sms
  
  const result = await sns.send(new SubscribeCommand({
    TopicArn: TOPIC_ARN,
    Protocol: protocol, // 'email' or 'sms'
    Endpoint: endpoint, // email address or phone number
    Attributes: {
      FilterPolicy: JSON.stringify({
        category: [req.body.category || 'all'] // Filter by joke category
      })
    }
  }));
  
  res.json({ 
    message: 'Subscription pending confirmation!',
    subscriptionArn: result.SubscriptionArn 
  });
});

// Admin: Publish joke of the day
app.post('/api/admin/joke-of-the-day', authenticate, async (req, res) => {
  const { joke, category } = req.body;
  
  await sns.send(new PublishCommand({
    TopicArn: TOPIC_ARN,
    Subject: '🎭 Joke of the Day!',
    Message: joke,
    MessageAttributes: {
      category: {
        DataType: 'String',
        StringValue: category
      }
    }
  }));
  
  res.json({ message: 'Joke published to all subscribers!' });
});`,
      difficulty: "easy"
    },
    bonusChallenge: "Add mobile push notifications using SNS Platform Applications!",
    resources: [
      { title: "SNS Developer Guide", url: "https://docs.aws.amazon.com/sns/latest/dg/welcome.html", type: "docs" },
      { title: "SNS Message Filtering", url: "https://docs.aws.amazon.com/sns/latest/dg/sns-message-filtering.html", type: "docs" }
    ]
  },
  {
    day: 12,
    week: 2,
    service: "Amazon SQS",
    icon: "📬",
    tagline: "Reliable message queuing!",
    duration: "3 hours",
    category: "messaging",
    objectives: [
      "Create standard and FIFO queues",
      "Implement producer-consumer patterns",
      "Handle dead-letter queues",
      "Process messages with Lambda"
    ],
    concepts: [
      "Standard vs FIFO queues",
      "Visibility timeout",
      "Dead Letter Queues (DLQ)",
      "Long polling",
      "Message batching"
    ],
    exercise: {
      title: "Async Joke Processing Pipeline",
      description: "Build a queue-based system! When a joke is submitted, queue it for moderation. A Lambda function processes the queue and either approves or rejects jokes.",
      codeSnippet: `const { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

const sqs = new SQSClient({ region: 'us-east-1' });
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/joke-moderation';
const DLQ_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/joke-moderation-dlq';

// Submit joke for moderation
app.post('/api/jokes/submit', authenticate, async (req, res) => {
  const joke = {
    id: crypto.randomUUID(),
    text: req.body.text,
    authorId: req.user.id,
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };
  
  // Save as pending
  await docClient.send(new PutCommand({
    TableName: 'Jokes',
    Item: joke
  }));
  
  // Queue for moderation
  await sqs.send(new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(joke),
    MessageAttributes: {
      AuthorId: { DataType: 'String', StringValue: req.user.id }
    }
  }));
  
  res.json({ message: 'Joke submitted for review!', jokeId: joke.id });
});

// Lambda function to process moderation queue
export const moderationHandler = async (event) => {
  for (const record of event.Records) {
    const joke = JSON.parse(record.body);
    
    try {
      // Simple moderation: check for bad words
      const isApproved = !containsBadWords(joke.text);
      
      await docClient.send(new UpdateCommand({
        TableName: 'Jokes',
        Key: { id: joke.id },
        UpdateExpression: 'SET #status = :status, moderatedAt = :now',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': isApproved ? 'approved' : 'rejected',
          ':now': new Date().toISOString()
        }
      }));
      
      // Notify author via SNS
      if (isApproved) {
        await sns.send(new PublishCommand({
          TopicArn: APPROVAL_TOPIC,
          Message: \`Your joke was approved! 🎉\`
        }));
      }
    } catch (error) {
      console.error('Moderation failed:', error);
      throw error; // Message goes to DLQ after max retries
    }
  }
};`,
      difficulty: "hard"
    },
    bonusChallenge: "Implement a FIFO queue to ensure jokes from the same user are processed in order!",
    resources: [
      { title: "SQS Developer Guide", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html", type: "docs" },
      { title: "Lambda with SQS", url: "https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html", type: "docs" }
    ]
  },
  {
    day: 13,
    week: 2,
    service: "CloudFormation",
    icon: "🏗️",
    tagline: "Infrastructure as Code - AWS Native!",
    duration: "3 hours",
    category: "iac",
    objectives: [
      "Write CloudFormation templates",
      "Understand stacks and changesets",
      "Use parameters and outputs",
      "Implement cross-stack references"
    ],
    concepts: [
      "Template anatomy (Resources, Parameters, Outputs)",
      "Intrinsic functions (!Ref, !GetAtt, !Sub)",
      "Stack updates and drift detection",
      "Nested stacks",
      "AWS SAM for serverless"
    ],
    exercise: {
      title: "Joke API Infrastructure Template",
      description: "Write a CloudFormation template that creates all the infrastructure for the Joke API: Lambda, API Gateway, DynamoDB table, and necessary IAM roles.",
      codeSnippet: `# joke-api-stack.yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: Joke API Infrastructure

Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues: [dev, staging, prod]

Resources:
  JokesTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'Jokes-\${Environment}'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      Tags:
        - Key: Environment
          Value: !Ref Environment

  JokeLambdaRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: DynamoDBAccess
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - dynamodb:GetItem
                  - dynamodb:PutItem
                  - dynamodb:Query
                  - dynamodb:Scan
                Resource: !GetAtt JokesTable.Arn

  JokeLambda:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub 'joke-api-\${Environment}'
      Runtime: nodejs20.x
      Handler: index.handler
      Role: !GetAtt JokeLambdaRole.Arn
      Environment:
        Variables:
          TABLE_NAME: !Ref JokesTable
          ENVIRONMENT: !Ref Environment
      Code:
        ZipFile: |
          exports.handler = async (event) => {
            return { statusCode: 200, body: 'Hello from Joke API!' };
          };

Outputs:
  TableName:
    Value: !Ref JokesTable
    Export:
      Name: !Sub '\${Environment}-JokesTableName'
  LambdaArn:
    Value: !GetAtt JokeLambda.Arn`,
      difficulty: "medium"
    },
    bonusChallenge: "Add API Gateway with Lambda integration to the template!",
    resources: [
      { title: "CloudFormation User Guide", url: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html", type: "docs" },
      { title: "CloudFormation Template Reference", url: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-reference.html", type: "docs" }
    ]
  },
  {
    day: 14,
    week: 2,
    service: "Terraform",
    icon: "🔷",
    tagline: "Multi-cloud Infrastructure as Code!",
    duration: "3 hours",
    category: "iac",
    objectives: [
      "Install and configure Terraform",
      "Write HCL configuration files",
      "Understand state management",
      "Use modules for reusability"
    ],
    concepts: [
      "Providers, Resources, and Data Sources",
      "State files and backends",
      "Variables and Outputs",
      "Modules",
      "Terraform Cloud/Enterprise"
    ],
    exercise: {
      title: "Terraform the Joke API",
      description: "Recreate the CloudFormation stack using Terraform! Experience the differences in syntax and workflow between the two IaC tools.",
      codeSnippet: `# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# variables.tf
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# dynamodb.tf
resource "aws_dynamodb_table" "jokes" {
  name         = "Jokes-\${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# lambda.tf
resource "aws_iam_role" "lambda_role" {
  name = "joke-api-lambda-role-\${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "joke_api" {
  function_name = "joke-api-\${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  filename      = "lambda.zip"

  environment {
    variables = {
      TABLE_NAME  = aws_dynamodb_table.jokes.name
      ENVIRONMENT = var.environment
    }
  }
}

# outputs.tf
output "dynamodb_table_name" {
  value = aws_dynamodb_table.jokes.name
}

output "lambda_function_arn" {
  value = aws_lambda_function.joke_api.arn
}`,
      difficulty: "medium"
    },
    bonusChallenge: "Create a Terraform module for the entire Joke API infrastructure!",
    resources: [
      { title: "Terraform AWS Provider", url: "https://registry.terraform.io/providers/hashicorp/aws/latest/docs", type: "docs" },
      { title: "Terraform Tutorials", url: "https://developer.hashicorp.com/terraform/tutorials", type: "tutorial" }
    ]
  },
  {
    day: 15,
    week: 2,
    service: "Final Project",
    icon: "🚀",
    tagline: "Launch your cloud masterpiece!",
    duration: "3 hours",
    category: "compute",
    objectives: [
      "Deploy complete infrastructure with IaC",
      "Implement all services learned",
      "Set up CI/CD pipeline",
      "Document your architecture"
    ],
    concepts: [
      "Full architecture review",
      "Best practices application",
      "Cost optimization",
      "Security hardening",
      "Production readiness"
    ],
    exercise: {
      title: "The Complete Joke Platform",
      description: "Deploy the full Joke Platform using Terraform! Include all services: Lambda, DynamoDB, S3, CloudFront, Cognito, SNS, SQS, and CloudWatch.",
      codeSnippet: `# FINAL PROJECT: Complete Architecture
#
# ┌────────────────────────────────────────────────────────────────────┐
# │                         CloudFront CDN                              │
# │                    (Global Edge Distribution)                       │
# └──────────────────────────┬─────────────────────────────────────────┘
#                            │
#          ┌─────────────────┴─────────────────┐
#          ▼                                   ▼
#    ┌──────────┐                       ┌──────────────┐
#    │    S3    │                       │ API Gateway  │
#    │ (Static) │                       └──────┬───────┘
#    └──────────┘                              │
#                                              ▼
#                     ┌─────────────────────────────────────────┐
#                     │              Lambda Functions            │
#                     │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
#                     │  │  CRUD   │ │ Upload  │ │Moderate │   │
#                     │  └────┬────┘ └────┬────┘ └────┬────┘   │
#                     └───────┼───────────┼───────────┼────────┘
#                             │           │           │
#    ┌───────────────────────┬┴───────────┴───────────┴────────┐
#    │                       │           │           │         │
#    ▼                       ▼           ▼           ▼         ▼
# ┌────────┐           ┌──────────┐ ┌─────────┐ ┌────────┐ ┌───────┐
# │Cognito │           │ DynamoDB │ │   S3    │ │  SQS   │ │  SNS  │
# │ (Auth) │           │  (Data)  │ │(Images) │ │(Queue) │ │(Notif)│
# └────────┘           └──────────┘ └─────────┘ └────────┘ └───────┘
#                             │
#                             ▼
#                      ┌──────────────┐
#                      │  CloudWatch  │
#                      │ (Monitoring) │
#                      └──────────────┘
#
# Deliverables:
# 1. Terraform modules for each service
# 2. Working API with all endpoints
# 3. CloudWatch dashboard
# 4. Documentation (README with architecture diagram)
# 5. Cost estimation for 10K daily active users
#
# BONUS: Set up GitHub Actions for CI/CD!

# Start command:
# terraform init
# terraform plan -var="environment=prod"
# terraform apply -var="environment=prod"`,
      difficulty: "hard"
    },
    bonusChallenge: "Present your architecture to a colleague and explain each service's role!",
    resources: [
      { title: "AWS Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", type: "docs" },
      { title: "AWS Architecture Center", url: "https://aws.amazon.com/architecture/", type: "docs" }
    ]
  }
];

export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  compute: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  storage: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  database: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  networking: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
  monitoring: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  security: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  messaging: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30" },
  iac: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" }
};

export const achievements = [
  { id: "first-server", name: "First Server!", description: "Launched your first EC2 instance", icon: "🖥️", day: 1 },
  { id: "bucket-master", name: "Bucket Master", description: "Created and configured an S3 bucket", icon: "🪣", day: 2 },
  { id: "serverless-hero", name: "Serverless Hero", description: "Deployed your first Lambda function", icon: "⚡", day: 3 },
  { id: "api-gateway-pro", name: "Gateway Guardian", description: "Built professional API Gateway", icon: "🚪", day: 4 },
  { id: "data-keeper", name: "Data Keeper", description: "Set up RDS database", icon: "🐘", day: 5 },
  { id: "nosql-ninja", name: "NoSQL Ninja", description: "Mastered DynamoDB", icon: "🥷", day: 6 },
  { id: "observer", name: "The Observer", description: "Created CloudWatch dashboards", icon: "📊", day: 7 },
  { id: "week1-complete", name: "Week 1 Complete!", description: "Finished Week 1 challenge", icon: "🏆", day: 8 },
  { id: "cdn-speedster", name: "CDN Speedster", description: "Set up CloudFront distribution", icon: "🌐", day: 9 },
  { id: "security-guard", name: "Security Guard", description: "Implemented Cognito auth", icon: "🔐", day: 10 },
  { id: "broadcaster", name: "Broadcaster", description: "Sent SNS notifications", icon: "📢", day: 11 },
  { id: "queue-master", name: "Queue Master", description: "Processed SQS messages", icon: "📬", day: 12 },
  { id: "cloud-architect", name: "Cloud Architect", description: "Wrote CloudFormation template", icon: "🏗️", day: 13 },
  { id: "terraform-pro", name: "Terraform Pro", description: "Deployed with Terraform", icon: "🔷", day: 14 },
  { id: "aws-graduate", name: "AWS Graduate!", description: "Completed the bootcamp!", icon: "🎓", day: 15 }
];
