#!/usr/bin/env bats

setup_file() {
    local repo_root
    repo_root="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
    "$repo_root/scripts/build-release-assets.sh" "$BATS_FILE_TMPDIR/assets"
}

setup() {
    REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/.." && pwd)"
    ASSET_DIR="$BATS_FILE_TMPDIR/assets"
}

@test "release build preserves the Skill asset" {
    [ -f "$ASSET_DIR/agentkey.skill" ]

    run unzip -Z1 "$ASSET_DIR/agentkey.skill"
    [ "$status" -eq 0 ]
    [[ "$output" == *"SKILL.md"* ]]
    [[ "$output" == *"scripts/check-update.sh"* ]]
}

@test "release build creates a Gemini archive for every supported platform" {
    [ -f "$ASSET_DIR/darwin.agentkey.tar.gz" ]
    [ -f "$ASSET_DIR/linux.agentkey.tar.gz" ]
    [ -f "$ASSET_DIR/win32.agentkey.zip" ]

    run cmp "$ASSET_DIR/darwin.agentkey.tar.gz" "$ASSET_DIR/linux.agentkey.tar.gz"
    [ "$status" -eq 0 ]
}

@test "Gemini release archives expose the manifest and Skill at their roots" {
    for archive_name in darwin.agentkey.tar.gz linux.agentkey.tar.gz; do
        run tar -tzf "$ASSET_DIR/$archive_name"
        [ "$status" -eq 0 ]
        [[ "$output" == *"gemini-extension.json"* ]]
        [[ "$output" == *"skills/agentkey/SKILL.md"* ]]
    done

    run unzip -Z1 "$ASSET_DIR/win32.agentkey.zip"
    [ "$status" -eq 0 ]
    [[ "$output" == *"gemini-extension.json"* ]]
    [[ "$output" == *"skills/agentkey/SKILL.md"* ]]
}
