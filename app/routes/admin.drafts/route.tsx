import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Pagination,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import {
  ActionFunctionArgs,
  data,
  LoaderFunctionArgs,
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "react-router";
import {
  DraftMode,
  DraftPhase,
  findDrafts,
} from "~/drizzle/draft.server";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  IconChevronDown,
  IconDatabase,
  IconEye,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import classes from "./styles.module.css";

type SortBy =
  | "createdAt"
  | "updatedAt"
  | "type"
  | "isComplete"
  | "mode"
  | "phase"
  | "progress"
  | "players";

const MODE_LABELS: Record<DraftMode, string> = {
  base: "Base",
  twilightsFall: "Twilight's Fall",
  texasStyle: "Texas Style",
  presetMap: "Preset Map",
};

const PHASE_LABELS: Record<DraftPhase, string> = {
  ban: "Ban",
  priorityValue: "Priority Value",
  homeSystem: "Home System",
  texasFaction: "Texas Faction",
  texasBlueKeep1: "Texas Blue Keep 1",
  texasBlueKeep2: "Texas Blue Keep 2",
  texasRedKeep: "Texas Red Keep",
  texasMapBuild: "Texas Map Build",
  standardPick: "Standard Pick",
  complete: "Complete",
};

const MODE_COLORS: Record<string, string> = {
  base: "blue",
  twilightsFall: "violet",
  texasStyle: "orange",
  presetMap: "teal",
};

function getModeLabel(mode: string): string {
  return MODE_LABELS[mode as DraftMode] ?? mode;
}

function getPhaseLabel(phase: string): string {
  return PHASE_LABELS[phase as DraftPhase] ?? phase;
}

function shortId(id: string): string {
  return id.substring(0, 8);
}

function formatDateTime(value: string): string {
  const d = new Date(value);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${time}`;
}

function clampPageSize(value: number): number {
  if (!Number.isFinite(value)) return 100;
  if (value < 25) return 25;
  if (value > 250) return 250;
  return value;
}

function progressColor(pct: number): string {
  if (pct >= 100) return "teal";
  if (pct >= 60) return "cyan";
  if (pct >= 25) return "yellow";
  return "red";
}

export default function AdminDraftsIndex() {
  const {
    drafts: draftsData,
    totalPages,
    currentPage,
    filteredTotal,
    stats,
  } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const updateParams = (
    updates: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (resetPage) {
      params.set("page", "1");
    }
    setSearchParams(params);
  };

  const handleSortChange = (column: SortBy) => {
    const currentSort = searchParams.get("sortBy");
    const currentOrder = searchParams.get("sortOrder");
    if (currentSort === column) {
      updateParams(
        { sortOrder: currentOrder === "asc" ? "desc" : "asc" },
        false,
      );
    } else {
      updateParams({ sortBy: column, sortOrder: "desc" }, false);
    }
  };

  const applyQuickFilter = (updates: Record<string, string | undefined>) =>
    updateParams(updates);

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("pageSize", searchParams.get("pageSize") || "100");
    params.set("sortBy", searchParams.get("sortBy") || "createdAt");
    params.set("sortOrder", searchParams.get("sortOrder") || "desc");
    setSearchParams(params);
    setSearchValue("");
  };

  const typeOptions = useMemo(
    () =>
      Object.entries(stats.draftsByType)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => ({
          value: type,
          label: `${type} (${count})`,
        })),
    [stats.draftsByType],
  );

  const modeOptions = useMemo(
    () =>
      Object.entries(stats.draftsByMode)
        .sort(([, a], [, b]) => b - a)
        .map(([mode, count]) => ({
          value: mode,
          label: `${getModeLabel(mode)} (${count})`,
        })),
    [stats.draftsByMode],
  );

  const phaseOptions = useMemo(
    () =>
      Object.entries(stats.draftsByPhase)
        .sort(([, a], [, b]) => b - a)
        .map(([phase, count]) => ({
          value: phase,
          label: `${getPhaseLabel(phase)} (${count})`,
        })),
    [stats.draftsByPhase],
  );

  const renderSortIcon = (column: SortBy) => {
    if (searchParams.get("sortBy") !== column) return null;
    const isAsc = searchParams.get("sortOrder") === "asc";
    return (
      <Text component="span" size="xs" ml={4}>
        {isAsc ? "\u25B2" : "\u25BC"}
      </Text>
    );
  };

  const handleDeleteSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = confirm("Are you sure you want to delete this draft?");
    if (result) {
      submit(new FormData(e.currentTarget), { method: "delete" });
    }
  };

  const hasActiveFilters =
    searchParams.has("modeFilter") ||
    searchParams.has("typeFilter") ||
    searchParams.has("phaseFilter") ||
    searchParams.has("isCompleteFilter") ||
    searchParams.has("search") ||
    searchParams.has("createdAfter") ||
    searchParams.has("createdBefore") ||
    searchParams.has("updatedAfter") ||
    searchParams.has("updatedBefore");

  return (
    <Box className={classes.page}>
      <Group justify="space-between" align="flex-end" mb="xl">
        <h1 className={classes.title}>Drafts</h1>
        <Text size="xs" c="dimmed">
          {stats.allDrafts.toLocaleString()} total records
        </Text>
      </Group>

      {/* Stats */}
      <div className={classes.statsGrid}>
        <div className={classes.statCard} style={{ "--stat-accent": "var(--mantine-color-blue-6)" } as React.CSSProperties}>
          <Text size="xs" c="dimmed" tt="uppercase" lts="0.05em">Total</Text>
          <Text className={classes.statValue}>{stats.allDrafts.toLocaleString()}</Text>
        </div>
        <div className={classes.statCard} style={{ "--stat-accent": "var(--mantine-color-violet-6)" } as React.CSSProperties}>
          <Text size="xs" c="dimmed" tt="uppercase" lts="0.05em">In Scope</Text>
          <Text className={classes.statValue}>{stats.scopedDrafts.toLocaleString()}</Text>
          <Text size="xs" c="dimmed">After filters</Text>
        </div>
        <div className={classes.statCard} style={{ "--stat-accent": "var(--mantine-color-cyan-6)" } as React.CSSProperties}>
          <Text size="xs" c="dimmed" tt="uppercase" lts="0.05em">Filtered</Text>
          <Text className={classes.statValue} c="cyan">{filteredTotal.toLocaleString()}</Text>
          <Text size="xs" c="dimmed">Current results</Text>
        </div>
        <div className={classes.statCard} style={{ "--stat-accent": "var(--mantine-color-teal-6)" } as React.CSSProperties}>
          <Text size="xs" c="dimmed" tt="uppercase" lts="0.05em">Completion</Text>
          <Text className={classes.statValue}>{stats.completionPercent.toFixed(1)}%</Text>
          <Text size="xs" c="dimmed">{stats.completedDrafts.toLocaleString()} completed</Text>
        </div>
      </div>

      {/* Filters */}
      <Stack gap="sm" mb="lg">
        <Group gap={6} wrap="wrap">
          <Button variant="default" size="compact-xs" onClick={() =>
            applyQuickFilter({ isCompleteFilter: "false", page: "1" })
          }>
            In Progress
          </Button>
          <Button variant="default" size="compact-xs" onClick={() =>
            applyQuickFilter({ modeFilter: "texasStyle", isCompleteFilter: "false", page: "1" })
          }>
            Texas Active
          </Button>
          <Button variant="default" size="compact-xs" onClick={() =>
            applyQuickFilter({ modeFilter: "twilightsFall", isCompleteFilter: "false", page: "1" })
          }>
            Twilight Active
          </Button>
          <Button variant="default" size="compact-xs" onClick={() =>
            applyQuickFilter({ phaseFilter: "ban", isCompleteFilter: "false", page: "1" })
          }>
            Ban Phase
          </Button>
          <Button variant="default" size="compact-xs" onClick={() =>
            applyQuickFilter({ isCompleteFilter: "true", page: "1" })
          }>
            Completed
          </Button>
          {hasActiveFilters && (
            <Button
              variant="subtle"
              size="compact-xs"
              color="red"
              leftSection={<IconX size={12} />}
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </Group>

        <TextInput
          placeholder="Search by URL, ID, player, or JSON..."
          leftSection={<IconSearch size={14} />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({ search: searchValue || undefined });
            }
          }}
          size="sm"
        />

        <SimpleGrid cols={{ base: 1, xs: 2, md: 5 }} spacing="sm">
          <Select
            label="Mode"
            placeholder="All modes"
            data={modeOptions}
            value={searchParams.get("modeFilter") || ""}
            onChange={(value) =>
              updateParams({ modeFilter: value || undefined })
            }
            clearable
            size="sm"
          />
          <Select
            label="Type"
            placeholder="All types"
            data={typeOptions}
            value={searchParams.get("typeFilter") || ""}
            onChange={(value) =>
              updateParams({ typeFilter: value || undefined })
            }
            clearable
            size="sm"
          />
          <Select
            label="Status"
            placeholder="All"
            data={[
              { value: "true", label: "Completed" },
              { value: "false", label: "In Progress" },
            ]}
            value={searchParams.get("isCompleteFilter") || ""}
            onChange={(value) =>
              updateParams({ isCompleteFilter: value || undefined })
            }
            clearable
            size="sm"
          />
          <Select
            label="Phase"
            placeholder="All phases"
            data={phaseOptions}
            value={searchParams.get("phaseFilter") || ""}
            onChange={(value) =>
              updateParams({ phaseFilter: value || undefined })
            }
            clearable
            size="sm"
          />
          <Select
            label="Page Size"
            data={[
              { value: "25", label: "25" },
              { value: "50", label: "50" },
              { value: "100", label: "100" },
              { value: "250", label: "250" },
            ]}
            value={searchParams.get("pageSize") || "100"}
            onChange={(value) =>
              updateParams({ pageSize: value || "100" })
            }
            size="sm"
          />
        </SimpleGrid>

        <Group justify="flex-end">
          <Button
            variant="subtle"
            size="compact-xs"
            color="dimmed"
            rightSection={
              <IconChevronDown
                size={12}
                style={{
                  transition: "transform 0.2s",
                  transform: filtersOpen ? "rotate(180deg)" : undefined,
                }}
              />
            }
            onClick={() => setFiltersOpen((v) => !v)}
          >
            Date Range
          </Button>
        </Group>

        <Collapse in={filtersOpen}>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
            <TextInput
              label="Created After"
              type="date"
              value={searchParams.get("createdAfter") || ""}
              onChange={(e) =>
                updateParams({ createdAfter: e.currentTarget.value || undefined })
              }
              size="sm"
            />
            <TextInput
              label="Created Before"
              type="date"
              value={searchParams.get("createdBefore") || ""}
              onChange={(e) =>
                updateParams({ createdBefore: e.currentTarget.value || undefined })
              }
              size="sm"
            />
            <TextInput
              label="Updated After"
              type="date"
              value={searchParams.get("updatedAfter") || ""}
              onChange={(e) =>
                updateParams({ updatedAfter: e.currentTarget.value || undefined })
              }
              size="sm"
            />
            <TextInput
              label="Updated Before"
              type="date"
              value={searchParams.get("updatedBefore") || ""}
              onChange={(e) =>
                updateParams({ updatedBefore: e.currentTarget.value || undefined })
              }
              size="sm"
            />
          </SimpleGrid>
        </Collapse>
      </Stack>

      <Divider mb="lg" />

      {/* Table */}
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={500}>
          {filteredTotal.toLocaleString()} results
        </Text>
      </Group>

      <Table.ScrollContainer minWidth={900}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Draft</Table.Th>
              <SortTh column="mode" label="Mode" active={searchParams.get("sortBy")} icon={renderSortIcon("mode")} onClick={handleSortChange} />
              <SortTh column="type" label="Type" active={searchParams.get("sortBy")} icon={renderSortIcon("type")} onClick={handleSortChange} />
              <SortTh column="isComplete" label="Status" active={searchParams.get("sortBy")} icon={renderSortIcon("isComplete")} onClick={handleSortChange} />
              <SortTh column="phase" label="Phase" active={searchParams.get("sortBy")} icon={renderSortIcon("phase")} onClick={handleSortChange} />
              <SortTh column="progress" label="Progress" active={searchParams.get("sortBy")} icon={renderSortIcon("progress")} onClick={handleSortChange} />
              <SortTh column="players" label="Players" active={searchParams.get("sortBy")} icon={renderSortIcon("players")} onClick={handleSortChange} />
              <SortTh column="createdAt" label="Created" active={searchParams.get("sortBy")} icon={renderSortIcon("createdAt")} onClick={handleSortChange} />
              <SortTh column="updatedAt" label="Updated" active={searchParams.get("sortBy")} icon={renderSortIcon("updatedAt")} onClick={handleSortChange} />
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {draftsData.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={10}>
                  <Stack align="center" py="xl" gap="sm">
                    <IconSearch size={32} color="var(--mantine-color-dark-3)" />
                    <Text size="sm" c="dimmed">
                      No records match current parameters
                    </Text>
                  </Stack>
                </Table.Td>
              </Table.Tr>
            )}

            {draftsData.map((draft) => (
              <Table.Tr key={draft.id}>
                <Table.Td>
                  <Text size="sm" fw={600} ff="monospace">
                    {shortId(draft.id)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {draft.urlName ?? "\u2014"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={MODE_COLORS[draft.mode] ?? "gray"}
                    size="sm"
                  >
                    {getModeLabel(draft.mode)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {draft.type ?? "unknown"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="dot"
                    color={draft.isComplete ? "teal" : "yellow"}
                    size="sm"
                  >
                    {draft.isComplete ? "Complete" : "Active"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {getPhaseLabel(draft.phase)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Stack gap={4} miw={100}>
                    <Text size="xs" ff="monospace" c="dimmed">
                      {draft.selectionsCount}/{draft.pickOrderCount} (
                      {draft.progressPercent.toFixed(0)}%)
                    </Text>
                    <Progress
                      value={Math.min(draft.progressPercent, 100)}
                      color={progressColor(draft.progressPercent)}
                      size="xs"
                    />
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" fw={600}>
                    {draft.playerCount}p
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1} maw={160}>
                    {draft.playerNames || "\u2014"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" ff="monospace" c="dimmed">
                    {formatDateTime(draft.createdAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" ff="monospace" c="dimmed">
                    {formatDateTime(draft.updatedAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon
                      component={Link}
                      to={`/draft/${draft.urlName ?? draft.id}`}
                      variant="light"
                      color="cyan"
                      size="sm"
                    >
                      <IconEye size={13} />
                    </ActionIcon>
                    <ActionIcon
                      component="a"
                      href={`/admin/drafts/${draft.urlName ?? draft.id}/raw`}
                      variant="light"
                      color="gray"
                      size="sm"
                    >
                      <IconDatabase size={13} />
                    </ActionIcon>
                    <Form method="delete" onSubmit={handleDeleteSubmit}>
                      <input type="hidden" value={draft.id} name="id" />
                      <ActionIcon
                        type="submit"
                        variant="subtle"
                        color="red"
                        size="sm"
                      >
                        <IconTrash size={13} />
                      </ActionIcon>
                    </Form>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Pagination */}
      <Group justify="space-between" mt="md" wrap="wrap">
        <Text size="xs" c="dimmed">
          Showing {draftsData.length} of {filteredTotal.toLocaleString()}{" "}
          filtered &middot; {stats.scopedDrafts.toLocaleString()} in scope
          &middot; {stats.allDrafts.toLocaleString()} total
        </Text>
        <Pagination
          total={Math.max(totalPages, 1)}
          value={currentPage}
          onChange={(page) => updateParams({ page: page.toString() }, false)}
          size="sm"
        />
      </Group>
    </Box>
  );
}

function SortTh({
  column,
  label,
  active,
  icon,
  onClick,
}: {
  column: SortBy;
  label: string;
  active: string | null;
  icon: React.ReactNode;
  onClick: (column: SortBy) => void;
}) {
  const isActive = active === column;
  return (
    <Table.Th
      className={classes.sortable}
      data-active={isActive || undefined}
      onClick={() => onClick(column)}
    >
      {label}
      {icon}
    </Table.Th>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const id = body.get("id");
  if (!id) return data({ ok: false }, { status: 400 });

  await db.delete(drafts).where(eq(drafts.id, id.toString()));
  return data({ ok: true });
}

function parseMode(value: string | null): DraftMode | undefined {
  if (!value) return undefined;
  if (
    value === "base" ||
    value === "twilightsFall" ||
    value === "texasStyle" ||
    value === "presetMap"
  ) {
    return value;
  }
  return undefined;
}

function parsePhase(value: string | null): DraftPhase | undefined {
  if (!value) return undefined;
  if (
    value === "ban" ||
    value === "priorityValue" ||
    value === "homeSystem" ||
    value === "texasFaction" ||
    value === "texasBlueKeep1" ||
    value === "texasBlueKeep2" ||
    value === "texasRedKeep" ||
    value === "texasMapBuild" ||
    value === "standardPick" ||
    value === "complete"
  ) {
    return value;
  }
  return undefined;
}

function parseSortBy(value: string | null): SortBy {
  if (
    value === "createdAt" ||
    value === "updatedAt" ||
    value === "type" ||
    value === "isComplete" ||
    value === "mode" ||
    value === "phase" ||
    value === "progress" ||
    value === "players"
  ) {
    return value;
  }
  return "createdAt";
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = clampPageSize(
    parseInt(url.searchParams.get("pageSize") || "100", 10),
  );
  const sortBy = parseSortBy(url.searchParams.get("sortBy"));
  const sortOrder = (url.searchParams.get("sortOrder") || "desc") as
    | "asc"
    | "desc";
  const typeFilter = url.searchParams.get("typeFilter") || undefined;
  const modeFilter = parseMode(url.searchParams.get("modeFilter"));
  const phaseFilter = parsePhase(url.searchParams.get("phaseFilter"));
  const isCompleteFilter = url.searchParams.get("isCompleteFilter")
    ? url.searchParams.get("isCompleteFilter") === "true"
    : undefined;
  const search = url.searchParams.get("search") || undefined;
  const createdAfter = url.searchParams.get("createdAfter") || undefined;
  const createdBefore = url.searchParams.get("createdBefore") || undefined;
  const updatedAfter = url.searchParams.get("updatedAfter") || undefined;
  const updatedBefore = url.searchParams.get("updatedBefore") || undefined;

  const draftsData = await findDrafts({
    page: Number.isNaN(page) ? 1 : Math.max(page, 1),
    pageSize,
    sortBy,
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
    typeFilter,
    modeFilter,
    phaseFilter,
    isCompleteFilter,
    search,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
  });

  return data(draftsData);
};
