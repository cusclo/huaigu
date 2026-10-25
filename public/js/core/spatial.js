// 核心空间计算模块：Albers 等积圆锥投影与同城坐标黄金角螺旋防重叠算法
const RAD = Math.PI / 180;
const P1 = 25 * RAD, P2 = 47 * RAD, L0 = 105 * RAD, F0 = 35 * RAD;
const N = (Math.sin(P1) + Math.sin(P2)) / 2;
const C = Math.cos(P1) ** 2 + 2 * N * Math.sin(P1);
const RHO0 = Math.sqrt(C - 2 * N * Math.sin(F0)) / N;

export function project(lon, lat) {
  const th = N * (lon * RAD - L0);
  const rho = Math.sqrt(C - 2 * N * Math.sin(lat * RAD)) / N;
  return [rho * Math.sin(th) * 1000, -(RHO0 - rho * Math.cos(th)) * 1000];
}

// 黄金角螺旋微距防重叠：保证西安、洛阳、南京、荆州等密集区域的古墓与古迹互不遮挡
export function decollideCoordinates(list, minDist = 0.24) {
  const placed = [];
  return list.map((item, idx) => {
    let lon = item.lon;
    let lat = item.lat;
    let attempt = 0;
    while (attempt < 32) {
      const collision = placed.find((p) => Math.hypot(p[0] - lon, p[1] - lat) < minDist);
      if (!collision) break;
      attempt++;
      const angle = attempt * 2.39996 + (idx % 7) * 0.35;
      const r = minDist * (0.62 + attempt * 0.14);
      lon = Number((item.lon + Math.cos(angle) * r * 1.15).toFixed(3));
      lat = Number((item.lat + Math.sin(angle) * r * 0.92).toFixed(3));
    }
    placed.push([lon, lat]);
    return {
      ...item,
      rawLon: item.lon,
      rawLat: item.lat,
      lon,
      lat,
      coords: [lon, lat],
    };
  });
}
