import { A as ensure_array_like, Q as sanitize_props, at as slot, h as attr_class, lt as stringify, st as spread_props } from "./chunks-CJh457eN.js";
import "./exports-BAQMwGYm.js";
import { a as escape_html } from "./escaping-_LzeiXuq.js";
import { t as attr } from "./attributes-Dog1ICvy.js";
import "./state.svelte-DH-R59PY.js";
import { t as Icon } from "./Icon-BJuLBbSM.js";
import { t as User_plus } from "./user-plus-BDK9LH5b.js";
import { t as X } from "./x-wAHTW-_A.js";

//#region .svelte-kit/adapter-bun/entries/pages/settings/members/_page.svelte.js
function Mail($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "mail" },
		sanitize_props($$props),
		{
			iconNode: [["rect", {
				"width": "20",
				"height": "16",
				"x": "2",
				"y": "4",
				"rx": "2"
			}], ["path", { "d": "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" }]],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function User_check($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "user-check" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
				["circle", {
					"cx": "9",
					"cy": "7",
					"r": "4"
				}],
				["polyline", { "points": "16 11 18 13 22 9" }]
			],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function User_x($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "user-x" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
				["circle", {
					"cx": "9",
					"cy": "7",
					"r": "4"
				}],
				["line", {
					"x1": "17",
					"x2": "22",
					"y1": "8",
					"y2": "13"
				}],
				["line", {
					"x1": "22",
					"x2": "17",
					"y1": "8",
					"y2": "13"
				}]
			],
			children: ($$renderer2) => {
				$$renderer2.push(`<!--[-->`);
				slot($$renderer2, $$props, "default", {});
				$$renderer2.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer2) => {
		let { data, form } = $$props;
		const isAdmin = data.user?.role === "owner" || data.user?.role === "admin";
		function roleBadge(role) {
			const map = {
				owner: "bg-accent/15 text-accent",
				admin: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
				member: "bg-bg-secondary text-text-secondary"
			};
			return map[role] ?? map.member;
		}
		function formatDate(d) {
			return new Date(d).toLocaleDateString("en", {
				month: "short",
				day: "numeric",
				year: "numeric"
			});
		}
		$$renderer2.push(`<div class="space-y-8"><div class="flex items-center justify-between"><div><h1 class="text-xl font-semibold text-text-primary">Members</h1> <p class="mt-1 text-sm text-text-secondary">${escape_html(data.members.length)} member${escape_html(data.members.length === 1 ? "" : "s")}</p></div> `);
		if (isAdmin) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<button type="button" class="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">`);
			User_plus($$renderer2, { size: 14 });
			$$renderer2.push(`<!----> Invite member</button>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div> `);
		$$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--> <div class="overflow-hidden rounded-lg border border-border"><table class="w-full text-sm"><thead class="border-b border-border bg-bg-secondary"><tr><th class="px-4 py-3 text-left text-xs font-medium text-text-secondary">Member</th><th class="px-4 py-3 text-left text-xs font-medium text-text-secondary">Role</th><th class="px-4 py-3 text-left text-xs font-medium text-text-secondary">Joined</th><th class="px-4 py-3 text-left text-xs font-medium text-text-secondary">Status</th>`);
		if (isAdmin) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<th class="px-4 py-3 text-right text-xs font-medium text-text-secondary">Actions</th>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></tr></thead><tbody class="divide-y divide-border"><!--[-->`);
		const each_array = ensure_array_like(data.members);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let member = each_array[$$index];
			$$renderer2.push(`<tr class="bg-bg-card transition hover:bg-bg-secondary/50"><td class="px-4 py-3"><div><p class="font-medium text-text-primary">${escape_html(member.name)}</p> <p class="text-xs text-text-secondary">${escape_html(member.email)}</p></div></td><td class="px-4 py-3"><span${attr_class(`rounded-full px-2 py-0.5 text-xs font-medium ${stringify(roleBadge(member.role))}`)}>${escape_html(member.role)}</span></td><td class="px-4 py-3 text-text-secondary">${escape_html(formatDate(member.created_at))}</td><td class="px-4 py-3">`);
			if (member.is_active) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<span class="text-xs text-text-secondary">Active</span>`);
			} else {
				$$renderer2.push("<!--[!-->");
				$$renderer2.push(`<span class="text-xs text-danger">Deactivated</span>`);
			}
			$$renderer2.push(`<!--]--></td>`);
			if (isAdmin) {
				$$renderer2.push("<!--[-->");
				$$renderer2.push(`<td class="px-4 py-3 text-right">`);
				if (member.id !== data.user?.id && member.role !== "owner") {
					$$renderer2.push("<!--[-->");
					if (member.is_active) {
						$$renderer2.push("<!--[-->");
						$$renderer2.push(`<form method="POST" action="?/deactivate" class="inline"><input type="hidden" name="userId"${attr("value", member.id)}/> <button type="submit" class="flex items-center gap-1 rounded px-2 py-1 text-xs text-text-secondary transition hover:bg-danger/10 hover:text-danger" title="Deactivate">`);
						User_x($$renderer2, { size: 12 });
						$$renderer2.push(`<!----> Deactivate</button></form>`);
					} else {
						$$renderer2.push("<!--[!-->");
						$$renderer2.push(`<form method="POST" action="?/reactivate" class="inline"><input type="hidden" name="userId"${attr("value", member.id)}/> <button type="submit" class="flex items-center gap-1 rounded px-2 py-1 text-xs text-text-secondary transition hover:bg-accent/10 hover:text-accent" title="Reactivate">`);
						User_check($$renderer2, { size: 12 });
						$$renderer2.push(`<!----> Reactivate</button></form>`);
					}
					$$renderer2.push(`<!--]-->`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--></td>`);
			} else $$renderer2.push("<!--[!-->");
			$$renderer2.push(`<!--]--></tr>`);
		}
		$$renderer2.push(`<!--]--></tbody></table></div> `);
		if (data.invitations.length > 0) {
			$$renderer2.push("<!--[-->");
			$$renderer2.push(`<div class="space-y-3"><h2 class="text-sm font-medium text-text-secondary">Pending Invitations (${escape_html(data.invitations.length)})</h2> <div class="space-y-2"><!--[-->`);
			const each_array_1 = ensure_array_like(data.invitations);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let inv = each_array_1[$$index_1];
				$$renderer2.push(`<div class="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3"><div class="flex items-center gap-3">`);
				Mail($$renderer2, {
					size: 14,
					class: "shrink-0 text-text-secondary"
				});
				$$renderer2.push(`<!----> <div><p class="text-sm font-medium text-text-primary">${escape_html(inv.email)}</p> <p class="text-xs text-text-secondary">Invited as <strong>${escape_html(inv.role)}</strong> `);
				if (inv.invited_by_name) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`by ${escape_html(inv.invited_by_name)}`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--> · Expires ${escape_html(formatDate(inv.expires_at))}</p></div></div> `);
				if (isAdmin) {
					$$renderer2.push("<!--[-->");
					$$renderer2.push(`<form method="POST" action="?/cancelInvitation"><input type="hidden" name="id"${attr("value", inv.id)}/> <button type="submit" class="rounded p-1.5 text-text-secondary/50 transition hover:bg-bg-hover hover:text-text-primary" title="Cancel invitation">`);
					X($$renderer2, { size: 14 });
					$$renderer2.push(`<!----></button></form>`);
				} else $$renderer2.push("<!--[!-->");
				$$renderer2.push(`<!--]--></div>`);
			}
			$$renderer2.push(`<!--]--></div></div>`);
		} else $$renderer2.push("<!--[!-->");
		$$renderer2.push(`<!--]--></div>`);
	});
}

//#endregion
export { _page as default };
//# sourceMappingURL=_page.svelte-B4yvPXSQ.js.map