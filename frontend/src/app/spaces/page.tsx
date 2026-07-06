"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader, SortPill, SpaceCard, CreateCard, icons } from "@d11n/ui";
import { spaces } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { isAuthenticated } from "@/lib/auth";
import { useSearch } from "@/providers/SearchProvider";
import { spaceVisual, demoTags, demoVisibility, demoMembers } from "@/lib/mockDesign";

export default function SpacesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openSearch } = useSearch();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.spaces.all(),
    queryFn: spaces.list,
  });

  const createMutation = useMutation({
    mutationFn: () => spaces.create("Neuer Space"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.spaces.all() }),
  });

  const lastOpened = data && data.length > 0 ? data[0].name : "—";

  return (
    <AppShell
      menuBar={{ active: "home", onHome: () => router.push("/spaces"), onSearch: openSearch, onAccount: () => router.push("/account") }}
      breadcrumb={[{ label: "Spaces", icon: icons.HomeIcon }]}
      maxWidth={1080}
    >
      <PageHeader
        title="Spaces"
        subtitle={isLoading ? "" : `${data?.length ?? 0} Spaces · zuletzt geöffnet: ${lastOpened}`}
        actions={
          <>
            <SortPill label="Zuletzt geändert" />
            <Button
              variant="contained"
              startIcon={<icons.AddIcon />}
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              Neuer Space
            </Button>
          </>
        }
      />

      {!isLoading && (
        <Grid container spacing={2.75}>
          {data?.map((space) => {
            const visual = spaceVisual(space.id);
            return (
              <Grid key={space.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <SpaceCard
                  name={space.name}
                  documentCount={space.documentCount}
                  directoryCount={space.directoryCount}
                  icon={visual.icon}
                  color={visual.color}
                  containerColor={visual.containerColor}
                  tags={demoTags(space.id)}
                  visibility={demoVisibility(space.id)}
                  members={demoMembers(space.id)}
                  onOpen={() => router.push(`/spaces/${space.id}`)}
                  onMenu={() => {}}
                />
              </Grid>
            );
          })}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CreateCard label="Neuen Space anlegen" onCreate={() => createMutation.mutate()} />
          </Grid>
        </Grid>
      )}
    </AppShell>
  );
}
