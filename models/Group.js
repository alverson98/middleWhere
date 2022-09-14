class Group {}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    longitute: {
      type: DataTypes.DECIMAL(15, 15),
      allowNull: false,
    },
    latitute: {
      type: DataTypes.DECIMAL(15, 15),
      allowNull: false,
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: "group",
  }
);
