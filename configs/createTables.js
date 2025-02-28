const knex = require("knex");
require("dotenv").config();

const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, //  Required for Render PostgreSQL
  },
});

// Function to create tables if they don’t exist
const createTables = async () => {
  try {
    //  Check & Create "requests" table
    const requestsExists = await db.schema.hasTable("requests");
    if (!requestsExists) {
      await db.schema.createTable("requests", (table) => {
        table.uuid("id").primary().defaultTo(db.raw("gen_random_uuid()"));
        table.string("status").notNullable().defaultTo("pending"); // 'pending', 'processing', 'completed'
        table.timestamp("created_at").defaultTo(db.fn.now());
      })
  
      console.log(" requests table created");
    } else {
      console.log(" requests table already exists");
    }

    //  Check & Create "images" table
    const imagesExists = await db.schema.hasTable("images");
    if (!imagesExists) {
      await db.schema.createTable("images", (table) => {
        table.uuid("id").primary().defaultTo(db.raw("gen_random_uuid()"));
        table.uuid("request_id").references("id").inTable("requests").onDelete("CASCADE");
        table.integer("serial_number").notNullable();
        table.string("product_name").notNullable();
        table.string("input_image_path").notNullable(); // Local file path or S3 URL
        table.string("output_image_path"); // Populated after processing
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
      console.log(" images table created");
    } else {
      console.log(" images table already exists");
    }
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  }
};

// Run table creation on startup
// createTables();

db.select('*').from('images').then((data)=>console.log(data));

