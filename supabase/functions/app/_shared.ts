import { createClient } from 'npm:@supabase/supabase-js@2';

export type ProfileRow = {
  id: string;
  user_id: number;
  email: string;
  name: string;
  nickname: string | null;
  gender: string | null;
  age: number | null;
  contact: string | null;
  major: string | null;
  location: string | null;
};

type GroupRow = {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
};

type CalendarRow = {
  id: number;
  group_id: number;
  name: string;
};

type GroupMemberRow = {
  group_id: number;
  user_id: number;
  role: 'OWNER' | 'MEMBER';
  joined_at: string;
};

type ScheduleRow = {
  id: number;
  group_id: number;
  creator_id: number;
  title: string;
  start_datetime: string;
  end_datetime: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string;
  created_at: string;
  updated_at: string;
};

type NamedCoordinate = {
  userName: string;
  latitude: number;
  longitude: number;
  address: string;
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const kakaoRestApiKey = Deno.env.get('KAKAO_REST_API_KEY');

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  throw new Error('Supabase environment variables are not configured.');
}

export const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const createUserClient = (authorization: string | null) =>
  createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: authorization
      ? {
          headers: {
            Authorization: authorization,
          },
        }
      : undefined,
  });

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const getOrigin = (req: Request) => req.headers.get('origin') ?? '*';

export const parseApiPath = (req: Request) => {
  const { pathname } = new URL(req.url);
  const parts = pathname.split('/').filter(Boolean);
  const apiIndex = parts.indexOf('api');

  if (apiIndex >= 0) {
    return `/${parts.slice(apiIndex).join('/')}`;
  }

  if (parts[0] === 'app') {
    return `/${parts.slice(1).join('/')}`;
  }

  return `/${parts.join('/')}`;
};

export const jsonResponse = (origin: string, payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': origin === 'null' ? '*' : origin,
      'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });

export const textResponse = (origin: string, payload: string, status = 200) =>
  new Response(payload, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': origin === 'null' ? '*' : origin,
      'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });

export const emptyResponse = (origin: string, status = 204) =>
  new Response(null, {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin === 'null' ? '*' : origin,
      'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });

export const parseRequestBody = async <T>(req: Request): Promise<T> => {
  const contentLength = req.headers.get('content-length');

  if (contentLength === '0') {
    return {} as T;
  }

  const text = await req.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
};

export const toUserInfoDto = (profile: ProfileRow) => ({
  userId: profile.user_id,
  email: profile.email,
  name: profile.name,
});

export const toScheduleResponseDto = (schedule: ScheduleRow) => ({
  scheduleId: schedule.id,
  groupId: schedule.group_id,
  creatorId: schedule.creator_id,
  title: schedule.title,
  startDatetime: schedule.start_datetime,
  endDatetime: schedule.end_datetime,
  description: schedule.description,
  latitude: schedule.latitude,
  longitude: schedule.longitude,
  address: schedule.address,
  createdAt: schedule.created_at,
  updatedAt: schedule.updated_at,
});

export const uniqueNumberList = (values: unknown) =>
  Array.from(
    new Set(
      Array.isArray(values)
        ? values
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0)
        : [],
    ),
  );

export const requireNonEmptyString = (value: unknown, message: string) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, message);
  }

  return value.trim();
};

export const getProfileByAuthId = async (authUserId: string) => {
  const { data, error } = await serviceClient
    .from('profiles')
    .select(
      'id, user_id, email, name, nickname, gender, age, contact, major, location',
    )
    .eq('id', authUserId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, '프로필 정보를 불러오지 못했습니다.', error);
  }

  if (!data) {
    throw new HttpError(404, '사용자 프로필이 없습니다.');
  }

  return data as ProfileRow;
};

export const getProfileByUserId = async (userId: number) => {
  const { data, error } = await serviceClient
    .from('profiles')
    .select(
      'id, user_id, email, name, nickname, gender, age, contact, major, location',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, '사용자 정보를 불러오지 못했습니다.', error);
  }

  if (!data) {
    throw new HttpError(404, '사용자를 찾을 수 없습니다.');
  }

  return data as ProfileRow;
};

export const getProfilesMapByUserIds = async (userIds: number[]) => {
  if (userIds.length === 0) {
    return new Map<number, ProfileRow>();
  }

  const { data, error } = await serviceClient
    .from('profiles')
    .select(
      'id, user_id, email, name, nickname, gender, age, contact, major, location',
    )
    .in('user_id', userIds);

  if (error) {
    throw new HttpError(500, '사용자 목록을 불러오지 못했습니다.', error);
  }

  return new Map<number, ProfileRow>(
    (data ?? []).map((profile) => [profile.user_id as number, profile as ProfileRow]),
  );
};

export const requireAuth = async (req: Request) => {
  const authorization = req.headers.get('authorization');
  if (!authorization) {
    throw new HttpError(401, '로그인이 필요합니다.');
  }

  const userClient = createUserClient(authorization);
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();

  if (error || !user) {
    throw new HttpError(401, '로그인이 필요합니다.', error);
  }

  const profile = await getProfileByAuthId(user.id);
  return { authUser: user, profile };
};

export const getGroupOrThrow = async (groupId: number) => {
  const { data, error } = await serviceClient
    .from('groups')
    .select('id, name, owner_id, created_at')
    .eq('id', groupId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, '그룹 정보를 불러오지 못했습니다.', error);
  }

  if (!data) {
    throw new HttpError(404, '그룹을 찾을 수 없습니다.');
  }

  return data as GroupRow;
};

export const ensureGroupMember = async (groupId: number, userId: number) => {
  const { data, error } = await serviceClient
    .from('group_members')
    .select('group_id, user_id, role, joined_at')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, '그룹 권한을 확인하지 못했습니다.', error);
  }

  if (!data) {
    throw new HttpError(403, '해당 그룹에 접근할 수 없습니다.');
  }

  return data as GroupMemberRow;
};

export const ensureGroupOwner = async (groupId: number, userId: number) => {
  const group = await getGroupOrThrow(groupId);

  if (group.owner_id !== userId) {
    throw new HttpError(403, '그룹 소유자만 수행할 수 있습니다.');
  }

  return group;
};

export const getGroupMembers = async (groupId: number) => {
  const { data, error } = await serviceClient
    .from('group_members')
    .select('group_id, user_id, role, joined_at')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new HttpError(500, '그룹 멤버를 불러오지 못했습니다.', error);
  }

  const members = (data ?? []) as GroupMemberRow[];
  const profilesMap = await getProfilesMapByUserIds(members.map((member) => member.user_id));

  return members
    .map((member) => profilesMap.get(member.user_id))
    .filter((member): member is ProfileRow => Boolean(member))
    .map((member) => ({
      userId: member.user_id,
      name: member.name,
    }));
};

export const buildGroupResponse = async (groupId: number) => {
  const group = await getGroupOrThrow(groupId);

  const { data: calendar, error: calendarError } = await serviceClient
    .from('calendars')
    .select('id, group_id, name')
    .eq('group_id', groupId)
    .maybeSingle();

  if (calendarError) {
    throw new HttpError(500, '캘린더 정보를 불러오지 못했습니다.', calendarError);
  }

  if (!calendar) {
    throw new HttpError(500, '그룹 캘린더가 없습니다.');
  }

  return {
    groupId: group.id,
    groupName: group.name,
    ownerId: group.owner_id,
    calendarId: (calendar as CalendarRow).id,
    calendarName: (calendar as CalendarRow).name,
    members: await getGroupMembers(group.id),
    createdAt: group.created_at,
  };
};

export const getScheduleOrThrow = async (groupId: number, scheduleId: number) => {
  const { data, error } = await serviceClient
    .from('schedules')
    .select(
      'id, group_id, creator_id, title, start_datetime, end_datetime, description, latitude, longitude, address, created_at, updated_at',
    )
    .eq('group_id', groupId)
    .eq('id', scheduleId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, '일정 정보를 불러오지 못했습니다.', error);
  }

  if (!data) {
    throw new HttpError(404, '일정을 찾을 수 없습니다.');
  }

  return data as ScheduleRow;
};

export const fetchRecommendations = async (
  categoryCode: 'CE7' | 'FD6',
  coordinates: NamedCoordinate[],
) => {
  if (!kakaoRestApiKey) {
    throw new HttpError(
      500,
      'KAKAO_REST_API_KEY secret이 설정되지 않았습니다.',
    );
  }

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new HttpError(400, '최소 2명의 위치 정보가 필요합니다.');
  }

  const normalized = coordinates.map((coordinate) => ({
    userName: requireNonEmptyString(coordinate.userName, '사용자 이름이 필요합니다.'),
    address: requireNonEmptyString(coordinate.address, '주소 정보가 필요합니다.'),
    latitude: Number(coordinate.latitude),
    longitude: Number(coordinate.longitude),
  }));

  const hasInvalidCoordinates = normalized.some(
    (coordinate) =>
      Number.isNaN(coordinate.latitude) || Number.isNaN(coordinate.longitude),
  );

  if (hasInvalidCoordinates) {
    throw new HttpError(400, '좌표 형식이 올바르지 않습니다.');
  }

  const avgLat =
    normalized.reduce((sum, coordinate) => sum + coordinate.latitude, 0) /
    normalized.length;
  const avgLng =
    normalized.reduce((sum, coordinate) => sum + coordinate.longitude, 0) /
    normalized.length;

  const url = new URL('https://dapi.kakao.com/v2/local/search/category.json');
  url.search = new URLSearchParams({
    category_group_code: categoryCode,
    x: String(avgLng),
    y: String(avgLat),
    radius: '2000',
    size: '10',
    sort: 'distance',
  }).toString();

  const response = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${kakaoRestApiKey}`,
    },
  });

  if (!response.ok) {
    throw new HttpError(502, '카카오 장소 추천 요청에 실패했습니다.');
  }

  const payload = await response.json();
  const documents = Array.isArray(payload.documents) ? payload.documents : [];
  const recommendedPlaces = documents.map((place: Record<string, unknown>) => ({
    placeName: String(place.place_name ?? ''),
    addressName: String(place.address_name ?? ''),
    roadAddressName: String(place.road_address_name ?? ''),
    latitude: Number(place.y ?? 0),
    longitude: Number(place.x ?? 0),
    distance: Number(place.distance ?? 0),
  }));

  const userNames = normalized.map((coordinate) => coordinate.userName);
  const userAddresses = Object.fromEntries(
    normalized.map((coordinate) => [coordinate.userName, coordinate.address]),
  );

  return {
    userNames,
    recommendedPlaces,
    title: `${userNames.join(', ')}의 추천 장소`,
    userAddresses,
  };
};
