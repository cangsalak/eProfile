import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { requireAuth } from '@/modules/core';
import { INITIAL_RPB1_FORM_DATA, Rpb1FormData } from '@/modules/users/types';

/**
 * Returns list of personnel with their Rpb1Record status.
 */
export async function handleGetRpb1List(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    const where: any = {};
    if (!isAdmin) {
      where.id = user.id;
    } else {
      if (search) {
        where.OR = [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { citizenId: { contains: search } },
          { badgeNo: { contains: search } },
        ];
      }
      if (department) {
        where.department = department;
      }
    }

    const personnelList = await prisma.personnel.findMany({
      where,
      select: {
        id: true,
        badgeNo: true,
        prefix: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        subDepartment: true,
        citizenId: true,
        phone: true,
        rpb1Records: {
          select: {
            id: true,
            status: true,
            updatedAt: true,
            version: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ department: 'asc' }, { firstName: 'asc' }],
    });

    const formatted = personnelList.map((p) => {
      const latestRpb1 = p.rpb1Records[0] || null;
      return {
        id: p.id,
        badgeNo: p.badgeNo,
        fullName: `${p.prefix} ${p.firstName} ${p.lastName}`,
        position: p.position,
        department: p.department,
        subDepartment: p.subDepartment,
        citizenId: p.citizenId,
        phone: p.phone,
        hasRpb1: Boolean(latestRpb1),
        rpb1Status: latestRpb1 ? latestRpb1.status : 'NOT_STARTED',
        rpb1Id: latestRpb1 ? latestRpb1.id : null,
        rpb1UpdatedAt: latestRpb1 ? latestRpb1.updatedAt : null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list RPB1 records';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Retrieves the RPB1 record for the given personnel.
 */
export async function handleGetRpb1ByPersonnelId(
  req: Request,
  context: { params: Record<string, string | string[]> | Promise<{ personnelId: string }> }
) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawParams = await context.params;
    const personnelId = (rawParams as any).personnelId || (rawParams as any).id;

    const isOwner = user.id === personnelId;
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'ไม่อนุญาตให้เข้าดูแบบฟอร์ม รปภ. 1 ของผู้อื่น (ดูได้เฉพาะของตนเองเท่านั้น)' },
        { status: 403 }
      );
    }

    const personnel = await prisma.personnel.findUnique({
      where: { id: personnelId },
    });

    if (!personnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }

    const existing = await prisma.rpb1Record.findFirst({
      where: { personnelId },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      const parseJson = (val: string | null | undefined, fallback: any) => {
        if (!val) return fallback;
        try {
          return JSON.parse(val);
        } catch {
          return fallback;
        }
      };

      const sanitizedExisting: Record<string, any> = {};
      for (const [key, val] of Object.entries(existing)) {
        sanitizedExisting[key] = val === null ? '' : val;
      }

      const record: Rpb1FormData = {
        ...INITIAL_RPB1_FORM_DATA,
        ...sanitizedExisting,
        age: existing.age ?? '',
        height: existing.height ?? '',
        weight: existing.weight ?? '',
        addressesPast15Years: parseJson(existing.addressesPast15Years, []),
        educations: parseJson(existing.educations, []),
        specialActivities: parseJson(existing.specialActivities, []),
        languages: parseJson(existing.languages, INITIAL_RPB1_FORM_DATA.languages),
        workHistory: parseJson(existing.workHistory, []),
        politicalSocialMemberships: parseJson(existing.politicalSocialMemberships, []),
        foreignTravels: parseJson(existing.foreignTravels, []),
        identificationDocuments: parseJson(existing.identificationDocuments, []),
        legalCases: parseJson(existing.legalCases, []),
        fatherDetails: parseJson(existing.fatherDetails, INITIAL_RPB1_FORM_DATA.fatherDetails),
        motherDetails: parseJson(existing.motherDetails, INITIAL_RPB1_FORM_DATA.motherDetails),
        maritalStatus: (existing.maritalStatus as any) || 'โสด',
        spouseFormerDetails: parseJson(existing.spouseFormerDetails, INITIAL_RPB1_FORM_DATA.spouseFormerDetails),
        spouseCurrentDetails: parseJson(existing.spouseCurrentDetails, INITIAL_RPB1_FORM_DATA.spouseCurrentDetails),
        children: parseJson(existing.children, []),
        siblings: parseJson(existing.siblings, []),
        relativesInGovernment: parseJson(existing.relativesInGovernment, []),
        overseasContacts: parseJson(existing.overseasContacts, []),
        cohabitants: parseJson(existing.cohabitants, []),
        closeFriendsRef: parseJson(existing.closeFriendsRef, []),
        supporters: parseJson(existing.supporters, []),
      };

      return NextResponse.json({
        exists: true,
        data: record,
        personnel,
      });
    }

    let calculatedAge: number | '' = '';
    if (personnel.dateOfBirth) {
      const birthYearMatch = personnel.dateOfBirth.match(/(\d{4})/);
      if (birthYearMatch) {
        const rawYear = parseInt(birthYearMatch[1], 10);
        const currentYear = new Date().getFullYear();
        const beYear = rawYear > 2400 ? rawYear - 543 : rawYear;
        calculatedAge = Math.max(1, currentYear - beYear);
      }
    }

    const rawAddress = personnel.currentAddress || '';
    const matchMoo = rawAddress.match(/^(.*?)(?:\s+|,|\/)*(?:หมู่ที่|หมู่|ม\.)\s*([0-9\u0E50-\u0E59]+)\s*$/);
    const parsedHouseNo = matchMoo ? matchMoo[1].trim() : rawAddress;
    const parsedMoo = matchMoo ? matchMoo[2].trim() : '';

    const autoFilled: Rpb1FormData = {
      ...INITIAL_RPB1_FORM_DATA,
      personnelId: personnel.id,
      titleRank: personnel.prefix || '',
      firstName: personnel.firstName || '',
      lastName: personnel.lastName || '',
      citizenId: personnel.citizenId || '',
      dateOfBirth: personnel.dateOfBirth || '',
      bloodGroup: personnel.bloodType || '',
      religion: personnel.religion || 'พุทธ',
      age: calculatedAge,
      currentHouseNo: parsedHouseNo,
      currentMoo: parsedMoo,
      currentSubdistrict: personnel.currentTambon || '',
      currentDistrict: personnel.currentAmphoe || '',
      currentProvince: personnel.currentProvince || '',
      currentPhone: personnel.phone || '',
      phoneMobile: personnel.mobile || personnel.phone || '',
      email: personnel.email || '',
      militaryRank: personnel.prefix || '',
      militaryBranchUnit: `${personnel.department || ''} ${personnel.subDepartment ? `(${personnel.subDepartment})` : ''}`.trim(),
      emergencyContactRankName: personnel.emergencyContactName || '',
      emergencyContactRelation: personnel.emergencyContactRelation || '',
      emergencyContactAddress: personnel.emergencyContactPhone || '',
      extraTitleName: `${personnel.prefix || ''} ${personnel.firstName || ''} ${personnel.lastName || ''}`.trim(),
      extraBloodGroup: personnel.bloodType || '',
      extraCurrentAddress: `${personnel.currentAddress || ''} ${personnel.currentTambon || ''} ${personnel.currentAmphoe || ''} ${personnel.currentProvince || ''} ${personnel.currentZipcode || ''}`.trim(),
      extraMobilePhone: personnel.mobile || personnel.phone || '',
      extraEmail: personnel.email || '',
    };

    return NextResponse.json({
      exists: false,
      data: autoFilled,
      personnel,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch RPB1 record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Creates or updates an RPB1 record for the personnel.
 */
export async function handleSaveRpb1ByPersonnelId(
  req: Request,
  context: { params: Record<string, string | string[]> | Promise<{ personnelId: string }> }
) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawParams = await context.params;
    const personnelId = (rawParams as any).personnelId || (rawParams as any).id;

    const isOwner = user.id === personnelId;
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json(
        {
          error: 'ไม่อนุญาตให้บันทึกหรือแก้ไขแบบฟอร์ม รปภ. 1 แทนผู้อื่น (กรอกได้เฉพาะของตนเอง หรือผู้ดูแลระบบระดับสูงสุด SUPER_ADMIN เท่านั้น)',
        },
        { status: 403 }
      );
    }

    const body: Rpb1FormData = await req.json();

    const stringifyJson = (val: any) => (typeof val === 'string' ? val : JSON.stringify(val ?? []));

    const payload = {
      status: body.status || 'COMPLETED',
      classification: body.classification || 'ลับ',
      photoUrl: body.photoUrl || null,
      titleRank: body.titleRank || null,
      firstName: body.firstName || null,
      middleName: body.middleName || null,
      lastName: body.lastName || null,
      gender: body.gender || null,
      age: typeof body.age === 'number' ? body.age : null,
      formerFirstName: body.formerFirstName || null,
      nameChangeDoc: body.nameChangeDoc || null,
      formerLastName: body.formerLastName || null,
      lastNameChangeDoc: body.lastNameChangeDoc || null,
      nickname: body.nickname || null,
      citizenId: body.citizenId || null,
      dateOfBirth: body.dateOfBirth || null,
      birthPlaceHospital: body.birthPlaceHospital || null,
      race: body.race || null,
      nationality: body.nationality || null,
      formerNationality: body.formerNationality || null,
      naturalizationDoc: body.naturalizationDoc || null,
      religion: body.religion || null,
      formerReligion: body.formerReligion || null,
      registeredHouseNo: body.registeredHouseNo || null,
      registeredVillage: body.registeredVillage || null,
      registeredMoo: body.registeredMoo || null,
      registeredSoi: body.registeredSoi || null,
      registeredRoad: body.registeredRoad || null,
      registeredSubdistrict: body.registeredSubdistrict || null,
      registeredDistrict: body.registeredDistrict || null,
      registeredProvince: body.registeredProvince || null,
      registeredPhone: body.registeredPhone || null,
      currentHouseNo: body.currentHouseNo || null,
      currentVillage: body.currentVillage || null,
      currentMoo: body.currentMoo || null,
      currentSoi: body.currentSoi || null,
      currentRoad: body.currentRoad || null,
      currentSubdistrict: body.currentSubdistrict || null,
      currentDistrict: body.currentDistrict || null,
      currentProvince: body.currentProvince || null,
      currentPhone: body.currentPhone || null,
      phoneLandline: body.phoneLandline || null,
      phoneMobile: body.phoneMobile || null,
      email: body.email || null,
      lineId: body.lineId || null,
      facebook: body.facebook || null,
      instagram: body.instagram || null,
      otherContact: body.otherContact || null,
      alienCardNo: body.alienCardNo || null,
      alienCardDate: body.alienCardDate || null,
      alienCardIssuedAt: body.alienCardIssuedAt || null,
      alienResidenceDocNo: body.alienResidenceDocNo || null,
      alienResidenceDocDate: body.alienResidenceDocDate || null,
      alienResidenceIssuedAt: body.alienResidenceIssuedAt || null,
      alienIdInThailand: body.alienIdInThailand || null,
      birthCountry: body.birthCountry || null,
      entryDateToThailand: body.entryDateToThailand || null,
      workPermitNo: body.workPermitNo || null,
      workPermitIssuedBy: body.workPermitIssuedBy || null,
      workPermitIssueDate: body.workPermitIssueDate || null,
      workPermitExpiryDate: body.workPermitExpiryDate || null,
      height: typeof body.height === 'number' ? body.height : null,
      weight: typeof body.weight === 'number' ? body.weight : null,
      scarsDistinguishingMarks: body.scarsDistinguishingMarks || null,
      bloodGroup: body.bloodGroup || null,
      addressesPast15Years: stringifyJson(body.addressesPast15Years),
      educations: stringifyJson(body.educations),
      specialActivities: stringifyJson(body.specialActivities),
      languages: stringifyJson(body.languages),
      workHistory: stringifyJson(body.workHistory),
      specialOccupationsHobbies: body.specialOccupationsHobbies || null,
      militaryStatus: body.militaryStatus || null,
      militaryRank: body.militaryRank || null,
      militaryRegNumber: body.militaryRegNumber || null,
      militaryBranchUnit: body.militaryBranchUnit || null,
      militaryUnitLocation: body.militaryUnitLocation || null,
      militaryServiceFrom: body.militaryServiceFrom || null,
      militaryServiceTo: body.militaryServiceTo || null,
      militaryYearsServed: body.militaryYearsServed || null,
      militaryDischargeReason: body.militaryDischargeReason || null,
      militaryLastCommander: body.militaryLastCommander || null,
      militarySpecialOperations: body.militarySpecialOperations || null,
      militarySpecialOpDate: body.militarySpecialOpDate || null,
      militarySpecialOpDuration: body.militarySpecialOpDuration || null,
      militaryExemptionReason: body.militaryExemptionReason || null,
      writerDetails: body.writerDetails || null,
      politicalSocialMemberships: stringifyJson(body.politicalSocialMemberships),
      foreignTravels: stringifyJson(body.foreignTravels),
      identificationDocuments: stringifyJson(body.identificationDocuments),
      legalCases: stringifyJson(body.legalCases),
      disciplinaryPunishments: body.disciplinaryPunishments || null,
      fatherDetails: JSON.stringify(body.fatherDetails || {}),
      motherDetails: JSON.stringify(body.motherDetails || {}),
      maritalStatus: body.maritalStatus || null,
      spouseFormerDetails: JSON.stringify(body.spouseFormerDetails || {}),
      spouseCurrentDetails: JSON.stringify(body.spouseCurrentDetails || {}),
      children: stringifyJson(body.children),
      siblings: stringifyJson(body.siblings),
      relativesInGovernment: stringifyJson(body.relativesInGovernment),
      overseasContacts: stringifyJson(body.overseasContacts),
      cohabitants: stringifyJson(body.cohabitants),
      closeFriendsRef: stringifyJson(body.closeFriendsRef),
      supporters: stringifyJson(body.supporters),
      additionalExplanations: body.additionalExplanations || null,
      ownerSignatureDate: body.ownerSignatureDate || null,
      inspectorRankName: body.inspectorRankName || null,
      inspectorPosition: body.inspectorPosition || null,
      inspectorSignatureDate: body.inspectorSignatureDate || null,
      sketchMapImage: body.sketchMapImage || null,
      mapHouseNo: body.mapHouseNo || null,
      mapVillage: body.mapVillage || null,
      mapMoo: body.mapMoo || null,
      mapSoi: body.mapSoi || null,
      mapRoad: body.mapRoad || null,
      mapSubdistrict: body.mapSubdistrict || null,
      mapDistrict: body.mapDistrict || null,
      mapProvince: body.mapProvince || null,
      mapPhone: body.mapPhone || null,
      mapHouseOwnerName: body.mapHouseOwnerName || null,
      mapHouseOwnerPhone: body.mapHouseOwnerPhone || null,
      emergencyContactRankName: body.emergencyContactRankName || null,
      emergencyContactRelation: body.emergencyContactRelation || null,
      emergencyContactAddress: body.emergencyContactAddress || null,
      extraTitleName: body.extraTitleName || null,
      extraGender: body.extraGender || null,
      extraBloodGroup: body.extraBloodGroup || null,
      extraRegisteredAddress: body.extraRegisteredAddress || null,
      extraCurrentAddress: body.extraCurrentAddress || null,
      extraIsSameAddress: Boolean(body.extraIsSameAddress),
      extraMobilePhone: body.extraMobilePhone || null,
      extraHomePhone: body.extraHomePhone || null,
      extraOfficePhone: body.extraOfficePhone || null,
      extraEmail: body.extraEmail || null,
      extraOwnerSignatureDate: body.extraOwnerSignatureDate || null,
      extraOfficerName: body.extraOfficerName || null,
      extraOfficerPosition: body.extraOfficerPosition || null,
      extraOfficerSignatureDate: body.extraOfficerSignatureDate || null,
    };

    const existing = await prisma.rpb1Record.findFirst({
      where: { personnelId },
    });

    let savedRecord;
    if (existing) {
      savedRecord = await prisma.rpb1Record.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      savedRecord = await prisma.rpb1Record.create({
        data: {
          personnelId,
          ...payload,
        },
      });
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: existing ? 'UPDATE_RPB1' : 'CREATE_RPB1',
        entity: 'Rpb1Record',
        entityId: savedRecord.id,
        details: JSON.stringify({ targetPersonnelId: personnelId, status: payload.status }),
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลแบบฟอร์ม รปภ. 1 เรียบร้อยแล้ว',
      data: savedRecord,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save RPB1 record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
