export type env = 'docker' | 'default';

export const EnvironmentPaths: {
  [K in env]: string;
} = {
  default: '.env',
  docker: '.env.docker',
};
