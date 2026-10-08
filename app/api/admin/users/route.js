import { NextResponse } from "next/server";
import { getCurrentUser, getAllUsers, deleteUser } from "@/lib/auth";
import { getOrders } from "@/lib/store";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const users = await getAllUsers();
    
    // Enrich with their orders and volume statistics
    const enriched = await Promise.all(
      users.map(async (u) => {
        const userOrders = await getOrders("All", "", u.id);
        const volume = userOrders.reduce((sum, o) => {
          const val = parseFloat((o.amountFiat || "").replace(/[^0-9.]/g, "")) || 0;
          return sum + val;
        }, 0);

        return {
          ...u,
          totalInvoices: userOrders.length,
          totalVolumeFiat: `$${volume.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: enriched,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    await deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
