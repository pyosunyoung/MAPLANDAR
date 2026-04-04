import { corsHeaders } from '../_shared/cors.ts';
import {
  HttpError,
  buildGroupResponse,
  emptyResponse,
  ensureGroupMember,
  ensureGroupOwner,
  fetchRecommendations,
  getGroupOrThrow,
  getOrigin,
  getProfileByUserId,
  getProfilesMapByUserIds,
  getScheduleOrThrow,
  jsonResponse,
  parseApiPath,
  parseRequestBody,
  requireAuth,
  requireNonEmptyString,
  serviceClient,
  textResponse,
  toScheduleResponseDto,
  toUserInfoDto,
  uniqueNumberList,
} from './_shared.ts';

type ProfileUpdatePayload = {
  email?: string;
  name?: string;
  nickname?: string | null;
  gender?: string | null;
  age?: number | null;
  contact?: string | null;
  major?: string | null;
  location?: string | null;
};

type FriendRequestPayload = {
  receiverEmail?: string;
  requesterId?: number;
  receiverId?: number;
};

type CreateGroupPayload = {
  groupName?: string;
  calendarName?: string;
  memberIds?: number[];
};

type UpdateGroupPayload = {
  groupName?: string;
};

type AddMembersPayload = {
  memberIds?: number[];
};

type SchedulePayload = {
  title?: string;
  description?: string | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  startDatetime?: string;
  endDatetime?: string;
};

type CoordinatePayload = {
  userName?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
};

const ensureNumberId = (value: string, message: string) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, message);
  }

  return parsed;
};

const normalizeSchedulePayload = (payload: SchedulePayload) => {
  const title = requireNonEmptyString(payload.title, '일정 제목이 필요합니다.');
  const address = requireNonEmptyString(payload.address, '주소 정보가 필요합니다.');
  const startDatetime = new Date(String(payload.startDatetime ?? ''));
  const endDatetime = new Date(String(payload.endDatetime ?? ''));
  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);

  if (Number.isNaN(startDatetime.getTime()) || Number.isNaN(endDatetime.getTime())) {
    throw new HttpError(400, '일정 시간 형식이 올바르지 않습니다.');
  }

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new HttpError(400, '좌표 형식이 올바르지 않습니다.');
  }

  if (endDatetime.getTime() < startDatetime.getTime()) {
    throw new HttpError(400, '종료 시간은 시작 시간보다 빠를 수 없습니다.');
  }

  return {
    title,
    description:
      typeof payload.description === 'string' && payload.description.trim().length > 0
        ? payload.description.trim()
        : null,
    address,
    latitude,
    longitude,
    start_datetime: startDatetime.toISOString(),
    end_datetime: endDatetime.toISOString(),
  };
};

const getErrorResponse = (origin: string, error: unknown) => {
  if (error instanceof HttpError) {
    return jsonResponse(
      origin,
      {
        status: error.status,
        message: error.message,
      },
      error.status,
    );
  }

  console.error(error);
  return jsonResponse(
    origin,
    {
      status: 500,
      message: '서버 오류가 발생했습니다.',
    },
    500,
  );
};

const handleAuthMe = async (req: Request, origin: string) => {
  const { profile } = await requireAuth(req);
  return jsonResponse(origin, {
    status: 200,
    data: toUserInfoDto(profile),
    message: '조회성공',
  });
};

const handleCheckEmail = async (req: Request, origin: string) => {
  const { searchParams } = new URL(req.url);
  const email = requireNonEmptyString(searchParams.get('email'), '이메일이 필요합니다.');

  const { data, error } = await serviceClient
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, '이메일 중복 확인에 실패했습니다.', error);
  }

  const available = !data;

  return jsonResponse(origin, {
    available,
    message: available
      ? '사용 가능한 이메일입니다.'
      : '이미 사용 중인 이메일입니다.',
  });
};

const handleProfileUpdate = async (req: Request, origin: string) => {
  const { authUser, profile } = await requireAuth(req);
  const payload = await parseRequestBody<ProfileUpdatePayload>(req);

  if (payload.email && payload.email.trim() !== profile.email) {
    throw new HttpError(
      400,
      '간이 배포본에서는 이메일 변경을 지원하지 않습니다.',
    );
  }

  const updates: Record<string, unknown> = {};

  if (payload.name !== undefined) {
    updates.name = requireNonEmptyString(payload.name, '이름이 필요합니다.');
  }

  if (payload.nickname !== undefined) {
    updates.nickname =
      typeof payload.nickname === 'string' && payload.nickname.trim().length > 0
        ? payload.nickname.trim()
        : null;
  }

  if (payload.gender !== undefined) {
    updates.gender =
      typeof payload.gender === 'string' && payload.gender.trim().length > 0
        ? payload.gender.trim()
        : null;
  }

  if (payload.contact !== undefined) {
    updates.contact =
      typeof payload.contact === 'string' && payload.contact.trim().length > 0
        ? payload.contact.trim()
        : null;
  }

  if (payload.major !== undefined) {
    updates.major =
      typeof payload.major === 'string' && payload.major.trim().length > 0
        ? payload.major.trim()
        : null;
  }

  if (payload.location !== undefined) {
    updates.location =
      typeof payload.location === 'string' && payload.location.trim().length > 0
        ? payload.location.trim()
        : null;
  }

  if (payload.age !== undefined) {
    updates.age =
      payload.age === null || payload.age === ''
        ? null
        : Number.isInteger(Number(payload.age))
          ? Number(payload.age)
          : (() => {
              throw new HttpError(400, '나이 형식이 올바르지 않습니다.');
            })();
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await serviceClient
      .from('profiles')
      .update(updates)
      .eq('id', authUser.id);

    if (error) {
      throw new HttpError(500, '회원 정보 수정에 실패했습니다.', error);
    }
  }

  const refreshed = await getProfileByUserId(profile.user_id);

  return jsonResponse(origin, {
    status: 200,
    data: toUserInfoDto(refreshed),
    message: '회원 정보가 수정되었습니다.',
  });
};

const handleFriendRequest = async (req: Request, origin: string) => {
  const { profile } = await requireAuth(req);
  const payload = await parseRequestBody<FriendRequestPayload>(req);
  const receiverEmail = requireNonEmptyString(
    payload.receiverEmail,
    '받는 사람 이메일이 필요합니다.',
  );

  const { data: receiver, error: receiverError } = await serviceClient
    .from('profiles')
    .select('id, user_id, email, name, nickname, gender, age, contact, major, location')
    .ilike('email', receiverEmail)
    .maybeSingle();

  if (receiverError) {
    throw new HttpError(500, '친구 요청 대상 조회에 실패했습니다.', receiverError);
  }

  if (!receiver) {
    throw new HttpError(404, '해당 이메일을 찾을 수 없습니다.');
  }

  if (receiver.user_id === profile.user_id) {
    throw new HttpError(400, '자기 자신에게 친구 요청을 보낼 수 없습니다.');
  }

  const { data: existingForward, error: forwardError } = await serviceClient
    .from('friend_requests')
    .select('requester_id')
    .eq('requester_id', profile.user_id)
    .eq('receiver_id', receiver.user_id)
    .maybeSingle();

  if (forwardError) {
    throw new HttpError(500, '친구 관계 확인에 실패했습니다.', forwardError);
  }

  const { data: existingBackward, error: backwardError } = await serviceClient
    .from('friend_requests')
    .select('requester_id')
    .eq('requester_id', receiver.user_id)
    .eq('receiver_id', profile.user_id)
    .maybeSingle();

  if (backwardError) {
    throw new HttpError(500, '친구 관계 확인에 실패했습니다.', backwardError);
  }

  if (existingForward || existingBackward) {
    throw new HttpError(400, '이미 친구 요청 또는 친구 관계가 존재합니다.');
  }

  const { error: insertError } = await serviceClient.from('friend_requests').insert({
    requester_id: profile.user_id,
    receiver_id: receiver.user_id,
    accepted: false,
  });

  if (insertError) {
    throw new HttpError(500, '친구 요청 저장에 실패했습니다.', insertError);
  }

  return jsonResponse(
    origin,
    {
      userId: receiver.user_id,
      name: receiver.name,
      accepted: false,
    },
    201,
  );
};

const handleFriendPending = async (req: Request, origin: string) => {
  const { profile } = await requireAuth(req);
  const { data, error } = await serviceClient
    .from('friend_requests')
    .select('requester_id')
    .eq('receiver_id', profile.user_id)
    .eq('accepted', false);

  if (error) {
    throw new HttpError(500, '친구 요청 목록 조회에 실패했습니다.', error);
  }

  const requesterIds = (data ?? []).map((row) => row.requester_id as number);
  const profilesMap = await getProfilesMapByUserIds(requesterIds);
  const pending = requesterIds
    .map((userId) => profilesMap.get(userId))
    .filter((item) => Boolean(item))
    .map((item) => ({
      userId: item!.user_id,
      name: item!.name,
      accepted: false,
    }));

  return jsonResponse(origin, {
    status: 200,
    data: pending,
  });
};

const handleFriendAccept = async (req: Request, origin: string) => {
  const { profile } = await requireAuth(req);
  const payload = await parseRequestBody<FriendRequestPayload>(req);
  const requesterId = ensureNumberId(String(payload.requesterId ?? ''), '요청자 ID가 필요합니다.');
  const receiverId = ensureNumberId(String(payload.receiverId ?? ''), '수신자 ID가 필요합니다.');

  if (receiverId !== profile.user_id) {
    throw new HttpError(403, '본인에게 온 요청만 처리할 수 있습니다.');
  }

  const { error } = await serviceClient
    .from('friend_requests')
    .update({ accepted: true })
    .eq('requester_id', requesterId)
    .eq('receiver_id', receiverId)
    .eq('accepted', false);

  if (error) {
    throw new HttpError(500, '친구 요청 수락에 실패했습니다.', error);
  }

  return textResponse(origin, '친구 요청을 수락했습니다.');
};

const handleFriendDecline = async (req: Request, origin: string) => {
  const { profile } = await requireAuth(req);
  const payload = await parseRequestBody<FriendRequestPayload>(req);
  const requesterId = ensureNumberId(String(payload.requesterId ?? ''), '요청자 ID가 필요합니다.');
  const receiverId = ensureNumberId(String(payload.receiverId ?? ''), '수신자 ID가 필요합니다.');

  if (receiverId !== profile.user_id) {
    throw new HttpError(403, '본인에게 온 요청만 처리할 수 있습니다.');
  }

  const { error } = await serviceClient
    .from('friend_requests')
    .delete()
    .eq('requester_id', requesterId)
    .eq('receiver_id', receiverId);

  if (error) {
    throw new HttpError(500, '친구 요청 거절에 실패했습니다.', error);
  }

  return textResponse(origin, '친구 요청을 거절했습니다.');
};

const handleFriendList = async (req: Request, origin: string) => {
  const { profile } = await requireAuth(req);

  const { data: sent, error: sentError } = await serviceClient
    .from('friend_requests')
    .select('receiver_id')
    .eq('requester_id', profile.user_id)
    .eq('accepted', true);

  if (sentError) {
    throw new HttpError(500, '친구 목록 조회에 실패했습니다.', sentError);
  }

  const { data: received, error: receivedError } = await serviceClient
    .from('friend_requests')
    .select('requester_id')
    .eq('receiver_id', profile.user_id)
    .eq('accepted', true);

  if (receivedError) {
    throw new HttpError(500, '친구 목록 조회에 실패했습니다.', receivedError);
  }

  const friendIds = [
    ...(sent ?? []).map((row) => row.receiver_id as number),
    ...(received ?? []).map((row) => row.requester_id as number),
  ];
  const profilesMap = await getProfilesMapByUserIds(friendIds);
  const friends = friendIds
    .map((userId) => profilesMap.get(userId))
    .filter((item) => Boolean(item))
    .map((item) => ({
      userId: item!.user_id,
      name: item!.name,
      accepted: true,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'ko'));

  return jsonResponse(origin, {
    status: 200,
    data: friends,
  });
};

const handleGroupList = async (req: Request, origin: string) => {
  const { profile } = await requireAuth(req);
  const { data, error } = await serviceClient
    .from('group_members')
    .select('group_id')
    .eq('user_id', profile.user_id);

  if (error) {
    throw new HttpError(500, '그룹 목록 조회에 실패했습니다.', error);
  }

  const groupIds = Array.from(
    new Set((data ?? []).map((row) => row.group_id as number)),
  );
  const groups = await Promise.all(groupIds.map((groupId) => buildGroupResponse(groupId)));
  groups.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  return jsonResponse(origin, groups);
};

const handleGroupDetail = async (
  req: Request,
  origin: string,
  groupId: number,
) => {
  const { profile } = await requireAuth(req);
  await ensureGroupMember(groupId, profile.user_id);
  return jsonResponse(origin, await buildGroupResponse(groupId));
};

const handleGroupCreate = async (req: Request, origin: string) => {
  const { profile } = await requireAuth(req);
  const payload = await parseRequestBody<CreateGroupPayload>(req);
  const groupName = requireNonEmptyString(payload.groupName, '그룹 이름이 필요합니다.');
  const calendarName = requireNonEmptyString(
    payload.calendarName,
    '캘린더 이름이 필요합니다.',
  );
  const memberIds = uniqueNumberList(payload.memberIds).filter(
    (userId) => userId !== profile.user_id,
  );

  if (memberIds.length === 0) {
    throw new HttpError(400, '최소 1명의 멤버를 선택해야 합니다.');
  }

  const profilesMap = await getProfilesMapByUserIds(memberIds);
  if (profilesMap.size !== memberIds.length) {
    throw new HttpError(400, '존재하지 않는 멤버가 포함되어 있습니다.');
  }

  const { data: group, error: groupError } = await serviceClient
    .from('groups')
    .insert({
      name: groupName,
      owner_id: profile.user_id,
    })
    .select('id')
    .single();

  if (groupError) {
    throw new HttpError(500, '그룹 생성에 실패했습니다.', groupError);
  }

  const groupId = group.id as number;

  const { error: calendarError } = await serviceClient.from('calendars').insert({
    group_id: groupId,
    name: calendarName,
  });

  if (calendarError) {
    throw new HttpError(500, '캘린더 생성에 실패했습니다.', calendarError);
  }

  const memberRows = [
    {
      group_id: groupId,
      user_id: profile.user_id,
      role: 'OWNER',
    },
    ...memberIds.map((userId) => ({
      group_id: groupId,
      user_id: userId,
      role: 'MEMBER',
    })),
  ];

  const { error: membersError } = await serviceClient
    .from('group_members')
    .insert(memberRows);

  if (membersError) {
    throw new HttpError(500, '그룹 멤버 저장에 실패했습니다.', membersError);
  }

  return jsonResponse(origin, await buildGroupResponse(groupId), 201);
};

const handleGroupRename = async (
  req: Request,
  origin: string,
  groupId: number,
) => {
  const { profile } = await requireAuth(req);
  await ensureGroupOwner(groupId, profile.user_id);

  const payload = await parseRequestBody<UpdateGroupPayload>(req);
  const groupName = requireNonEmptyString(payload.groupName, '그룹 이름이 필요합니다.');

  const { error: groupError } = await serviceClient
    .from('groups')
    .update({ name: groupName })
    .eq('id', groupId);

  if (groupError) {
    throw new HttpError(500, '그룹 이름 변경에 실패했습니다.', groupError);
  }

  const { error: calendarError } = await serviceClient
    .from('calendars')
    .update({ name: groupName })
    .eq('group_id', groupId);

  if (calendarError) {
    throw new HttpError(500, '캘린더 이름 변경에 실패했습니다.', calendarError);
  }

  return jsonResponse(origin, {
    groupId,
    groupName,
  });
};

const handleGroupDelete = async (
  req: Request,
  origin: string,
  groupId: number,
) => {
  const { profile } = await requireAuth(req);
  await ensureGroupOwner(groupId, profile.user_id);

  const { error } = await serviceClient.from('groups').delete().eq('id', groupId);

  if (error) {
    throw new HttpError(500, '그룹 삭제에 실패했습니다.', error);
  }

  return emptyResponse(origin);
};

const handleGroupAddMembers = async (
  req: Request,
  origin: string,
  groupId: number,
) => {
  const { profile } = await requireAuth(req);
  await ensureGroupOwner(groupId, profile.user_id);

  const payload = await parseRequestBody<AddMembersPayload>(req);
  const requestedIds = uniqueNumberList(payload.memberIds).filter(
    (userId) => userId !== profile.user_id,
  );

  if (requestedIds.length === 0) {
    throw new HttpError(400, '추가할 멤버가 없습니다.');
  }

  const profilesMap = await getProfilesMapByUserIds(requestedIds);
  if (profilesMap.size !== requestedIds.length) {
    throw new HttpError(400, '존재하지 않는 멤버가 포함되어 있습니다.');
  }

  const { data: existingMembers, error: existingError } = await serviceClient
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);

  if (existingError) {
    throw new HttpError(500, '기존 멤버 확인에 실패했습니다.', existingError);
  }

  const existingIds = new Set((existingMembers ?? []).map((row) => row.user_id as number));
  const newIds = requestedIds.filter((userId) => !existingIds.has(userId));

  if (newIds.length === 0) {
    return jsonResponse(origin, []);
  }

  const { error: insertError } = await serviceClient.from('group_members').insert(
    newIds.map((userId) => ({
      group_id: groupId,
      user_id: userId,
      role: 'MEMBER',
    })),
  );

  if (insertError) {
    throw new HttpError(500, '멤버 추가에 실패했습니다.', insertError);
  }

  return jsonResponse(
    origin,
    newIds.map((userId) => ({
      userId,
      name: profilesMap.get(userId)?.name ?? '',
    })),
    201,
  );
};

const handleGroupRemoveMember = async (
  req: Request,
  origin: string,
  groupId: number,
  memberId: number,
) => {
  const { profile } = await requireAuth(req);
  const group = await ensureGroupOwner(groupId, profile.user_id);

  if (group.owner_id === memberId) {
    throw new HttpError(400, '그룹 소유자는 멤버 삭제 대상이 될 수 없습니다.');
  }

  const { error } = await serviceClient
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', memberId);

  if (error) {
    throw new HttpError(500, '멤버 삭제에 실패했습니다.', error);
  }

  return emptyResponse(origin);
};

const handleGroupLeave = async (
  req: Request,
  origin: string,
  groupId: number,
) => {
  const { profile } = await requireAuth(req);
  const group = await getGroupOrThrow(groupId);
  await ensureGroupMember(groupId, profile.user_id);

  if (group.owner_id === profile.user_id) {
    const { error } = await serviceClient.from('groups').delete().eq('id', groupId);
    if (error) {
      throw new HttpError(500, '그룹 삭제에 실패했습니다.', error);
    }
  } else {
    const { error } = await serviceClient
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', profile.user_id);

    if (error) {
      throw new HttpError(500, '그룹 탈퇴에 실패했습니다.', error);
    }
  }

  return emptyResponse(origin);
};

const handleScheduleList = async (
  req: Request,
  origin: string,
  groupId: number,
) => {
  const { profile } = await requireAuth(req);
  await ensureGroupMember(groupId, profile.user_id);

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  let query = serviceClient
    .from('schedules')
    .select(
      'id, group_id, creator_id, title, start_datetime, end_datetime, description, latitude, longitude, address, created_at, updated_at',
    )
    .eq('group_id', groupId)
    .order('start_datetime', { ascending: true });

  if (date) {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59.999`;
    query = query.gte('start_datetime', startOfDay).lte('start_datetime', endOfDay);
  }

  const { data, error } = await query;

  if (error) {
    throw new HttpError(500, '일정 조회에 실패했습니다.', error);
  }

  return jsonResponse(
    origin,
    (data ?? []).map((schedule) => toScheduleResponseDto(schedule)),
  );
};

const handleScheduleDetail = async (
  req: Request,
  origin: string,
  groupId: number,
  scheduleId: number,
) => {
  const { profile } = await requireAuth(req);
  await ensureGroupMember(groupId, profile.user_id);
  return jsonResponse(
    origin,
    toScheduleResponseDto(await getScheduleOrThrow(groupId, scheduleId)),
  );
};

const handleScheduleCreate = async (
  req: Request,
  origin: string,
  groupId: number,
) => {
  const { profile } = await requireAuth(req);
  await ensureGroupMember(groupId, profile.user_id);
  const payload = normalizeSchedulePayload(await parseRequestBody<SchedulePayload>(req));

  const { data, error } = await serviceClient
    .from('schedules')
    .insert({
      group_id: groupId,
      creator_id: profile.user_id,
      ...payload,
    })
    .select(
      'id, group_id, creator_id, title, start_datetime, end_datetime, description, latitude, longitude, address, created_at, updated_at',
    )
    .single();

  if (error) {
    throw new HttpError(500, '일정 생성에 실패했습니다.', error);
  }

  return jsonResponse(origin, toScheduleResponseDto(data), 201);
};

const handleScheduleUpdate = async (
  req: Request,
  origin: string,
  groupId: number,
  scheduleId: number,
) => {
  const { profile } = await requireAuth(req);
  await ensureGroupMember(groupId, profile.user_id);
  const schedule = await getScheduleOrThrow(groupId, scheduleId);

  if (schedule.creator_id !== profile.user_id) {
    throw new HttpError(403, '일정 작성자만 수정할 수 있습니다.');
  }

  const payload = normalizeSchedulePayload(await parseRequestBody<SchedulePayload>(req));
  const { data, error } = await serviceClient
    .from('schedules')
    .update(payload)
    .eq('id', scheduleId)
    .select(
      'id, group_id, creator_id, title, start_datetime, end_datetime, description, latitude, longitude, address, created_at, updated_at',
    )
    .single();

  if (error) {
    throw new HttpError(500, '일정 수정에 실패했습니다.', error);
  }

  return jsonResponse(origin, toScheduleResponseDto(data));
};

const handleScheduleDelete = async (
  req: Request,
  origin: string,
  groupId: number,
  scheduleId: number,
) => {
  const { profile } = await requireAuth(req);
  await ensureGroupMember(groupId, profile.user_id);
  const schedule = await getScheduleOrThrow(groupId, scheduleId);

  if (schedule.creator_id !== profile.user_id) {
    throw new HttpError(403, '일정 작성자만 삭제할 수 있습니다.');
  }

  const { error } = await serviceClient.from('schedules').delete().eq('id', scheduleId);

  if (error) {
    throw new HttpError(500, '일정 삭제에 실패했습니다.', error);
  }

  return emptyResponse(origin);
};

const handleRecommendation = async (
  req: Request,
  origin: string,
  categoryCode: 'CE7' | 'FD6',
) => {
  await requireAuth(req);
  const payload = await parseRequestBody<CoordinatePayload[]>(req);
  return jsonResponse(origin, await fetchRecommendations(categoryCode, payload));
};

Deno.serve(async (req) => {
  const origin = getOrigin(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  try {
    const apiPath = parseApiPath(req);

    if (req.method === 'GET' && apiPath === '/') {
      return jsonResponse(origin, { ok: true, service: 'maplandar-app' });
    }

    if (req.method === 'GET' && apiPath === '/api/auth/me') {
      return await handleAuthMe(req, origin);
    }

    if (req.method === 'GET' && apiPath === '/api/auth/check-email') {
      return await handleCheckEmail(req, origin);
    }

    if (req.method === 'PUT' && apiPath === '/api/profile') {
      return await handleProfileUpdate(req, origin);
    }

    if (req.method === 'POST' && apiPath === '/api/friends/request') {
      return await handleFriendRequest(req, origin);
    }

    if (req.method === 'GET' && apiPath === '/api/friends/pending') {
      return await handleFriendPending(req, origin);
    }

    if (req.method === 'POST' && apiPath === '/api/friends/accept') {
      return await handleFriendAccept(req, origin);
    }

    if (req.method === 'POST' && apiPath === '/api/friends/decline') {
      return await handleFriendDecline(req, origin);
    }

    if (req.method === 'GET' && apiPath === '/api/friends/list') {
      return await handleFriendList(req, origin);
    }

    if (req.method === 'GET' && apiPath === '/api/groups') {
      return await handleGroupList(req, origin);
    }

    if (req.method === 'POST' && apiPath === '/api/groups') {
      return await handleGroupCreate(req, origin);
    }

    const groupMatch = apiPath.match(/^\/api\/groups\/(\d+)$/);
    if (groupMatch) {
      const groupId = ensureNumberId(groupMatch[1], '유효하지 않은 그룹 ID입니다.');

      if (req.method === 'GET') {
        return await handleGroupDetail(req, origin, groupId);
      }

      if (req.method === 'PUT') {
        return await handleGroupRename(req, origin, groupId);
      }

      if (req.method === 'DELETE') {
        return await handleGroupDelete(req, origin, groupId);
      }
    }

    const groupMembersMatch = apiPath.match(/^\/api\/groups\/(\d+)\/members$/);
    if (groupMembersMatch && req.method === 'POST') {
      return await handleGroupAddMembers(
        req,
        origin,
        ensureNumberId(groupMembersMatch[1], '유효하지 않은 그룹 ID입니다.'),
      );
    }

    const groupMemberMatch = apiPath.match(/^\/api\/groups\/(\d+)\/members\/(\d+)$/);
    if (groupMemberMatch && req.method === 'DELETE') {
      return await handleGroupRemoveMember(
        req,
        origin,
        ensureNumberId(groupMemberMatch[1], '유효하지 않은 그룹 ID입니다.'),
        ensureNumberId(groupMemberMatch[2], '유효하지 않은 멤버 ID입니다.'),
      );
    }

    const groupLeaveMatch = apiPath.match(/^\/api\/groups\/(\d+)\/leave$/);
    if (groupLeaveMatch && req.method === 'DELETE') {
      return await handleGroupLeave(
        req,
        origin,
        ensureNumberId(groupLeaveMatch[1], '유효하지 않은 그룹 ID입니다.'),
      );
    }

    const scheduleListMatch = apiPath.match(/^\/api\/groups\/(\d+)\/schedules$/);
    if (scheduleListMatch) {
      const groupId = ensureNumberId(scheduleListMatch[1], '유효하지 않은 그룹 ID입니다.');

      if (req.method === 'GET') {
        return await handleScheduleList(req, origin, groupId);
      }

      if (req.method === 'POST') {
        return await handleScheduleCreate(req, origin, groupId);
      }
    }

    const scheduleDetailMatch = apiPath.match(
      /^\/api\/groups\/(\d+)\/schedules\/(\d+)$/,
    );
    if (scheduleDetailMatch) {
      const groupId = ensureNumberId(scheduleDetailMatch[1], '유효하지 않은 그룹 ID입니다.');
      const scheduleId = ensureNumberId(
        scheduleDetailMatch[2],
        '유효하지 않은 일정 ID입니다.',
      );

      if (req.method === 'GET') {
        return await handleScheduleDetail(req, origin, groupId, scheduleId);
      }

      if (req.method === 'PUT') {
        return await handleScheduleUpdate(req, origin, groupId, scheduleId);
      }

      if (req.method === 'DELETE') {
        return await handleScheduleDelete(req, origin, groupId, scheduleId);
      }
    }

    if (req.method === 'POST' && apiPath === '/api/locations/recommend/cafes') {
      return await handleRecommendation(req, origin, 'CE7');
    }

    if (req.method === 'POST' && apiPath === '/api/locations/recommend/foods') {
      return await handleRecommendation(req, origin, 'FD6');
    }

    throw new HttpError(404, `지원하지 않는 경로입니다: ${req.method} ${apiPath}`);
  } catch (error) {
    return getErrorResponse(origin, error);
  }
});
