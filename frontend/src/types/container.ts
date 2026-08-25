export type ContainerStatus = "running" | "stopped";

export type Container = {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  raw_status: string | null;
  project: string | null;
};

export type ContainersResponse = {
  available: boolean;
  data: Container[];
};