const std = @import("std");
const cfg = @import("./build-cfg.zig");

fn comptime_concat(comptime a: []const u8, comptime b: []const u8) []const u8 {
    return a ++ b;
}

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});
    const lib = b.addSharedLibrary(.{
        .name = cfg.module_name,
        .root_source_file = .{ .cwd_relative = cfg.stub_path },
        .target = target,
        .optimize = optimize,
    });
    const imports = .{};
    const mod = b.createModule(.{
        .root_source_file = .{ .cwd_relative = cfg.module_path },
        .imports = &imports,
    });

    mod.addIncludePath(.{ .cwd_relative = cfg.module_dir });
    lib.root_module.addImport("module", mod);

    // xdelta3 Build Configuration
    // -------------------------------------------------
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();

    const xdelta3_dir = std.fs.path.resolve(allocator, &.{ cfg.module_dir, "../xdelta/xdelta3" }) catch unreachable;
    const xdelta3_src = std.fs.path.resolve(allocator, &.{ xdelta3_dir, "xdelta3.c" }) catch unreachable;

    defer allocator.free(xdelta3_dir);
    defer allocator.free(xdelta3_src);

    lib.addIncludePath(.{ .cwd_relative = xdelta3_dir });
    lib.addCSourceFile(.{ .file = .{ .cwd_relative = xdelta3_src }, .flags = &.{ "-Wall", "-DSIZEOF_SIZE_T=8", "-std=c99" } });
    // -------------------------------------------------

    if (cfg.is_wasm) {
        // WASM needs to be compiled as exe
        lib.kind = .exe;
        lib.linkage = .static;
        lib.entry = .disabled;
        lib.rdynamic = true;
        lib.wasi_exec_model = .reactor;
    }
    if (cfg.use_libc) {
        lib.linkLibC();
    }
    const wf = switch (@hasDecl(std.Build, "addUpdateSourceFiles")) {
        true => b.addUpdateSourceFiles(),
        false => b.addWriteFiles(),
    };
    wf.addCopyFileToSource(lib.getEmittedBin(), cfg.output_path);
    wf.step.dependOn(&lib.step);
    b.getInstallStep().dependOn(&wf.step);
}
