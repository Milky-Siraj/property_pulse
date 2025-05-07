import connectDB from "@/config/database";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";
import cloudinary from "@/config/cloudinary";

// GET /api/properties
export const GET = async (request) => {
  try {
    await connectDB();

    const page = request.nextUrl.searchParams.get("page") || 1;
    const pageSize = request.nextUrl.searchParams.get("pageSize") || 6;

    const skip = (page - 1) * pageSize;

    const total = await Property.countDocuments({});

    const properties = await Property.find({}).skip(skip).limit(pageSize);

    const result = {
      total,
      properties,
    };
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Something Went Wrong", { status: 500 });
  }
};

export const POST = async (request) => {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { userId } = sessionUser;
    const formData = await request.formData();

    // Access all values from amenities and images
    const amenities = formData.getAll("amenities");
    const images = formData
      .getAll("images")
      .filter((image) => image.name !== "");

    // Validate required fields
    const type = formData.get("type");
    if (!type) {
      return new Response(
        JSON.stringify({ message: "Property type is required" }),
        { status: 400 }
      );
    }

    // Create propertyData object for database
    const propertyData = {
      type: type,
      name: formData.get("name") || "",
      description: formData.get("description") || "",
      location: {
        street: formData.get("location.street") || "",
        city: formData.get("location.city") || "",
        state: formData.get("location.state") || "",
        zipcode: formData.get("location.zipcode") || "",
      },
      beds: formData.get("beds") || "",
      baths: formData.get("baths") || "",
      square_feet: formData.get("square_feet") || "",
      amenities,
      rates: {
        weekly: formData.get("rates.weekly") || "",
        monthly: formData.get("rates.monthly") || "",
        nightly: formData.get("rates.nightly") || "",
      },
      seller_info: {
        name: formData.get("seller_info.name") || "",
        email: formData.get("seller_info.email") || "",
        phone: formData.get("seller_info.phone") || "",
      },
      owner: userId,
    };

    // Log the property data for debugging
    console.log('Creating property with data:', propertyData);

    // Upload images to Cloudinary
    const imageUploadPromises = [];

    for (const image of images) {
      try {
        // Convert the image to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString("base64");
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(
          `data:${image.type};base64,${base64String}`,
          {
            folder: "propertyPulse",
            resource_type: "auto",
          }
        );

        imageUploadPromises.push(result.secure_url);
      } catch (error) {
        console.error("Error processing image:", error);
        return new Response(
          JSON.stringify({ message: "Error uploading images" }),
          { status: 500 }
        );
      }
    }

    // Wait for all images to be uploaded
    const uploadedImages = await Promise.all(imageUploadPromises);
    // Add the uploaded images to propertyData
    propertyData.images = uploadedImages;

    try {
      const newProperty = new Property(propertyData);
      await newProperty.save();
      return new Response(JSON.stringify(newProperty), { status: 201 });
    } catch (error) {
      console.error("Error saving property:", error);
      return new Response(
        JSON.stringify({ message: error.message || "Error saving property" }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: "Failed to add property" }), {
      status: 500,
    });
  }
};
