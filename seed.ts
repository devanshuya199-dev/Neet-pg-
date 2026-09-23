import { PrismaClient, CollegeType, BranchType, CounselingRound, Quota, Category } from "@prisma/client";

const prisma = new PrismaClient();

const colleges = [
  ["Maulana Azad Medical College", "Delhi", CollegeType.Govt, 1959, 2500, 125000, 128000, 132000, 1, 1500000],
  ["King George's Medical University", "Uttar Pradesh", CollegeType.Govt, 1905, 4500, 105000, 108000, 112000, 2, 1000000],
  ["Seth GS Medical College", "Maharashtra", CollegeType.Govt, 1926, 3000, 95000, 98000, 101000, 1, 1000000],
  ["VMMC & Safdarjung Hospital", "Delhi", CollegeType.Central, 2001, 1531, 120000, 123000, 126000, 1, 1000000],
  ["Lady Hardinge Medical College", "Delhi", CollegeType.Central, 1916, 877, 100000, 103000, 106000, 1, 1000000],
  ["Kasturba Medical College, Manipal", "Karnataka", CollegeType.Deemed, 1953, 2000, 90000, 93000, 96000, 0, 0],
  ["Christian Medical College, Vellore", "Tamil Nadu", CollegeType.Private, 1900, 2670, 85000, 88000, 91000, 0, 0],
  ["Amrita School of Medicine", "Kerala", CollegeType.Private, 1998, 1350, 75000, 78000, 81000, 0, 0],
  ["GMC Chandigarh", "Chandigarh", CollegeType.Govt, 1991, 1094, 110000, 113000, 116000, 1, 1000000],
  ["SMS Medical College", "Rajasthan", CollegeType.Govt, 1947, 2800, 100000, 103000, 106000, 2, 1200000],
  ["DNB National Board Accredited Hospital - Delhi", "Delhi", CollegeType.DNB, 2000, 500, 80000, 82000, 84000, 0, 0],
  ["Institute of Medical Sciences, BHU", "Uttar Pradesh", CollegeType.Central, 1960, 2500, 100000, 103000, 106000, 1, 1000000]
] as const;

const branches = [
  ["MD General Medicine", BranchType.Clinical],
  ["MD Radio-Diagnosis", BranchType.Clinical],
  ["MS General Surgery", BranchType.Clinical],
  ["MD Dermatology", BranchType.Clinical],
  ["MD Obstetrics & Gynaecology", BranchType.Clinical],
  ["MD Paediatrics", BranchType.Clinical],
  ["MD Anaesthesiology", BranchType.Clinical],
  ["MD Psychiatry", BranchType.Clinical],
  ["MD Pathology", BranchType.ParaClinical],
  ["MD Pharmacology", BranchType.NonClinical],
  ["DNB Paediatrics", BranchType.Clinical]
] as const;

function cutoffFor(branch: string, collegeType: CollegeType, i: number) {
  const base: Record<string, number> = {
    "MD General Medicine": 650,
    "MD Radio-Diagnosis": 900,
    "MS General Surgery": 2500,
    "MD Dermatology": 1200,
    "MD Obstetrics & Gynaecology": 4500,
    "MD Paediatrics": 5200,
    "MD Anaesthesiology": 8500,
    "MD Psychiatry": 15000,
    "MD Pathology": 26000,
    "MD Pharmacology": 70000,
    "DNB Paediatrics": 18000
  };
  let multiplier = collegeType === CollegeType.Govt || collegeType === CollegeType.Central ? 1 : collegeType === CollegeType.Deemed ? 3.2 : 2.4;
  const variation = 1 + ((i % 5) - 2) * 0.07;
  return Math.max(150, Math.round((base[branch] ?? 20000) * multiplier * variation));
}

async function main() {
  await prisma.cutoff.deleteMany();
  await prisma.college.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.marksVsRankHistory.deleteMany();

  const collegeRows: Record<string, string> = {};
  for (const c of colleges) {
    const row = await prisma.college.create({
      data: {
        name: c[0], state: c[1], collegeType: c[2], establishedYear: c[3],
        hospitalBeds: c[4], stipendYear1: c[5], stipendYear2: c[6], stipendYear3: c[7],
        bondYears: c[8], bondPenaltyInr: c[9]
      }
    });
    collegeRows[c[0]] = row.id;
  }

  const branchRows: Record<string, string> = {};
  for (const b of branches) {
    const row = await prisma.branch.create({ data: { name: b[0], type: b[1] } });
    branchRows[b[0]] = row.id;
  }

  for (let i = 0; i < colleges.length; i++) {
    const college = colleges[i];
    for (const branch of branches) {
      for (const year of [2023, 2024, 2025]) {
        for (const round of [CounselingRound.R1, CounselingRound.R2, CounselingRound.R3]) {
          const closing = cutoffFor(branch[0], college[2], i) * (1 + (2025 - year) * 0.05) * (round === CounselingRound.R2 ? 1.12 : round === CounselingRound.R3 ? 1.25 : 1);
          await prisma.cutoff.create({
            data: {
              collegeId: collegeRows[college[0]],
              branchId: branchRows[branch[0]],
              year, counselingRound: round,
              quota: college[2] === CollegeType.DNB ? Quota.DNB : college[2] === CollegeType.Deemed ? Quota.Management : Quota.AIQ,
              category: Category.UR,
              openingRank: Math.max(1, Math.round(closing * 0.55)),
              closingRank: Math.round(closing),
              feePerAnnum: college[2] === CollegeType.Govt || college[2] === CollegeType.Central ? 150000 : college[2] === CollegeType.Deemed ? 6500000 : 1800000,
              isMock: true
            }
          });
        }
      }
    }
  }

  const curves = [
    [2023, [[700, 1, 10], [650, 200, 900], [600, 1800, 6000], [550, 8000, 20000], [500, 25000, 60000], [450, 70000, 140000]]],
    [2024, [[700, 1, 10], [650, 180, 800], [600, 1600, 5500], [550, 7500, 19000], [500, 23000, 57000], [450, 65000, 135000]]],
    [2025, [[700, 1, 10], [650, 150, 750], [600, 1500, 5000], [550, 7000, 18000], [500, 21000, 54000], [450, 62000, 130000]]],
    [2026, [[700, 1, 10], [650, 140, 700], [600, 1400, 4800], [550, 6800, 17500], [500, 20000, 52000], [450, 60000, 128000]]]
  ] as const;

  for (const [year, rows] of curves) {
    for (const [score, min, max] of rows) {
      await prisma.marksVsRankHistory.create({ data: { year, score, airMin: min, airMax: max } });
    }
  }
}

main().finally(() => prisma.$disconnect());
