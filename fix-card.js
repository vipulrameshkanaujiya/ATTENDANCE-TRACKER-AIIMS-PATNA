const fs = require('fs');
const filepath = 'components/student/PreSeptemberAttendanceCard.tsx';
let code = fs.readFileSync(filepath, 'utf8');

code = code.replace(/      CFM: \{ theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" \},\r?\n    \};/,
`      CFM: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
      OBG: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
    };`);

fs.writeFileSync(filepath, code);
