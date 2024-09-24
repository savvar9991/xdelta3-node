const std = @import("std");
const xdelta3 = @import("./xdelta3.zig");

// Compression level 9
const encoding_flags = xdelta3.XD3_COMPLEVEL_1 | xdelta3.XD3_SMATCH_FASTEST;
const decoding_flags = xdelta3.XD3_COMPLEVEL_1;

const Process = enum {
    Encoding,
    Decoding,
};

pub fn processXd3InMemory(src: []const u8, dest: []const u8, process: Process, flags: i32) ![]const u8 {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();

    const src_len: usize = src.len;
    const dest_len: usize = dest.len;

    // We don't know exact size for the patch yet
    var output_size: usize = 0;
    // Let's allocate some memory based on estiamte
    var output_allocated_size = src_len + dest_len;
    // Add 20% more to larget buffer
    output_allocated_size = output_allocated_size + (output_allocated_size * 20 / 100);
    var output_buffer = try std.ArrayList(u8).initCapacity(allocator, output_allocated_size);
    defer output_buffer.deinit();

    while (true) {
        const ret = if (process == Process.Encoding) xdelta3.xd3_encode_memory(&dest[0], dest_len, &src[0], src_len, output_buffer.items.ptr, &output_size, output_allocated_size, flags) else xdelta3.xd3_decode_memory(&dest[0], dest_len, &src[0], src_len, output_buffer.items.ptr, &output_size, output_allocated_size, flags);
        if (ret == 0) break;

        switch (@as(std.c.E, @enumFromInt(ret))) {
            .NOSPC => {
                // Add 10% more size
                output_allocated_size = output_allocated_size + (output_allocated_size / 10 * 100);
                output_buffer.ensureTotalCapacity(output_allocated_size) catch unreachable;
            },
            else => {
                std.debug.print("{} failure:! {}\n", .{ process, ret });
                break;
            },
        }
    }

    // Now we know the exact size of the patch
    output_buffer.shrinkAndFree(output_size);

    // As the buffer list will be deallocated on the return of the function
    // we need to copy it in a memory which does not deallocate
    const output = try allocator.alloc(u8, output_buffer.capacity);
    @memcpy(output, output_buffer.items);

    return output;
}

pub fn encodeSync(src: []const u8, dest: []const u8) ![]const u8 {
    return processXd3InMemory(src, dest, Process.Encoding, decoding_flags);
}

pub fn decodeSync(src: []const u8, patch: []const u8) ![]const u8 {
    return processXd3InMemory(src, patch, Process.Decoding, decoding_flags);
}
