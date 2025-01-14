const awsConfig = {
  aws_project_region: process.env.NEXT_PUBLIC_COGNITO_REGION || "sa-east-1",
  aws_user_pools_id: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
};

export default awsConfig;