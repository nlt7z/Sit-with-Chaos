export const merchants = [
  { id: "m1", name: "张师傅家电维修", rating: 4.8, orders: 1280, distance: "0.8km", verified: true, avatarSeed: "zhang" },
  { id: "m2", name: "快修到家服务", rating: 4.7, orders: 2100, distance: "1.2km", verified: true, avatarSeed: "kuaixiu" },
  { id: "m3", name: "李师傅管道", rating: 4.6, orders: 890, distance: "1.5km", verified: false, avatarSeed: "li" },
  { id: "m4", name: "24小时管道服务", rating: 4.9, orders: 3200, distance: "2.1km", verified: true, avatarSeed: "24h" },
  { id: "m5", name: "王师傅维修", rating: 4.5, orders: 560, distance: "2.8km", verified: false, avatarSeed: "wang" },
];

export const mockQuoteSchedule = [
  {
    merchantId: "m1",
    delayMs: 1200,
    price: 150,
    includes: ["30分钟内上门", "基础工具", "1小时质保"],
    earliestTime: "14:30",
    expiresInMin: 28,
    bestMatch: true,
  },
  {
    merchantId: "m2",
    delayMs: 2500,
    price: 180,
    includes: ["立即上门", "上下设备", "24小时质保"],
    earliestTime: "14:00",
    expiresInMin: 25,
  },
  {
    merchantId: "m4",
    delayMs: 3800,
    price: 120,
    includes: ["1小时内上门", "基础工具"],
    earliestTime: "15:30",
    expiresInMin: 30,
  },
  {
    merchantId: "m3",
    delayMs: 5000,
    price: 165,
    includes: ["今日上门", "基础工具", "30分钟质保"],
    earliestTime: "16:00",
    expiresInMin: 22,
  },
  { merchantId: "m5", delayMs: null },
];

export const symptomOptions = ["堵塞", "漏水", "冲水无力", "异味", "不确定", "其他"];

export type Merchant = (typeof merchants)[number];
export type QuoteScheduleItem = (typeof mockQuoteSchedule)[number];
