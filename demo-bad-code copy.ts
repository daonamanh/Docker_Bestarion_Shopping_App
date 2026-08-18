// File cố tình vi phạm 9 luật Complexity để test Linter
export function processUserDataBadExample(
  p1: string, p2: number, p3: boolean, p4: string[], p5: object, p6: number // ❌ Max Params > 5
) {
  let count = 0;
  
  // ❌ Max Depth > 4 cấp & Cognitive Complexity
  if (p1 === "ADMIN") {
    if (p2 > 100) {
      if (p3) {
        for (let i = 0; i < p4.length; i++) {
          if (p4[i] === "SUPER_USER") {
            try {
              // ❌ No Nested Ternary
              const status = p2 > 200 ? (p3 ? "ACTIVE" : "PENDING") : "INACTIVE";
              console.log(status);
            } catch (e) {
              console.error(e);
            }
          }
        }
      }
    }
  }

  // ❌ Max Nested Callbacks > 3 cấp
  setTimeout(() => {
    setTimeout(() => {
      setTimeout(() => {
        setTimeout(() => {
          console.log("Deep callback hell!");
        }, 100);
      }, 100);
    }, 100);
  }, 100);

  // ❌ Max Statements & Lines (> 30 câu lệnh)
  count++; count++; count++; count++; count++; count++;
  count++; count++; count++; count++; count++; count++;
  count++; count++; count++; count++; count++; count++;
  count++; count++; count++; count++; count++; count++;
  count++; count++; count++; count++; count++; count++;

  return count;
}

// export function processUserDataClean(
//   userId: string,
//   role: string
// ): boolean {
//   if (!userId || !role) {
//     return false;
//   }
//   return role === "ADMIN";
// }