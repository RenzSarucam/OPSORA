import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Projects", value: "—" },
  { label: "Online", value: "—" },
  { label: "Warning", value: "—" },
  { label: "Offline", value: "—" },
  { label: "Active Alerts", value: "—" },
  { label: "Avg Response Time", value: "—" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Good afternoon, Admin</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening across your infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Project monitoring will appear here once projects are added.
        </CardContent>
      </Card>
    </div>
  );
}