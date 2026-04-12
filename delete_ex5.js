const delFilter = {
  $expr: {
    $and: [
      { $lt: ["$attendance", 50] },
      {
        $gt: [
          {
            $size: {
              $filter: {
                input: "$courses",
                as: "c",
                cond: { $eq: ["$$c.grade", "F"] }
              }
            }
          },
          1
        ]
      }
    ]
  }
};

print("Before Delete:");
print(JSON.stringify(db.students.find(delFilter, { _id: 0, name: 1, attendance: 1, courses: 1 }).toArray(), null, 2));
const delResult = db.students.deleteMany(delFilter);
print("Deleted Count:" + delResult.deletedCount);
print("After Delete:");
print(JSON.stringify(db.students.find({}, { _id: 0, name: 1, attendance: 1 }).sort({ name: 1 }).toArray(), null, 2));
