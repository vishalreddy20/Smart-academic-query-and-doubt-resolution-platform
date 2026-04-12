const filter = {
  $expr: {
    $and: [
      { $lt: ["$attendance", 95] },
      {
        $gte: [
          {
            $size: {
              $filter: {
                input: "$courses",
                as: "c",
                cond: { $in: ["$$c.grade", ["A", "B"]] }
              }
            }
          },
          2
        ]
      }
    ]
  }
};

print("Before Update:");
print(JSON.stringify(db.students.find(filter, { _id: 0, name: 1, attendance: 1, courses: 1 }).toArray(), null, 2));
const result = db.students.updateMany(filter, [
  { $set: { attendance: { $min: [95, { $add: ["$attendance", 5] }] } } }
]);
print("Updated Count:" + result.modifiedCount);
print("After Update:");
print(JSON.stringify(db.students.find({ name: { $in: ["Aarav Reddy", "Bhavya Nair", "Charan Kumar"] } }, { _id: 0, name: 1, attendance: 1 }).toArray(), null, 2));
