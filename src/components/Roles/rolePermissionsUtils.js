import {
    ALL_PERMISSION_ENTRIES,
    PERMISSION_CATEGORIES,
    VIEW_PERMISSION_CATEGORIES,
} from "../../constants/rolePermissions";

export const buildPermissionMap = (categories = PERMISSION_CATEGORIES) => {
    const allowed = new Set(categories);
    return ALL_PERMISSION_ENTRIES.reduce((acc, entry) => {
        if (!allowed.has(entry.category)) return acc;
        if (!acc[entry.category]) acc[entry.category] = [];
        acc[entry.category].push(entry.permission);
        return acc;
    }, {});
};

export const getEnabledInCategory = (_category, allInCategory, enabledPermissions) =>
    allInCategory.filter((p) => enabledPermissions.includes(p));

export { VIEW_PERMISSION_CATEGORIES, PERMISSION_CATEGORIES };
