const readFilter = {
  attendance: { $lt: 75 },
  courses: { $elemMatch: { grade: "F" } }
};
print("Read Result:");
print(JSON.stringify(db.students.find(readFilter, { _id: 0, name: 1, attendance: 1, courses: 1 }).toArray(), null, 2));
