/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*
--------------------------------------------------------------------------
index.js
--------------------------------------------------------------------------
Name:     index.js
Purpose:  Main javascript code for Persephone.
Author:   James Loach, Zheng Li
Email:    james.loach@gmail.com, ronnie.alonso@gmail.com
--------------------------------------------------------------------------
*/

var httpType = window.location.href.split(':')[0]; // e.g. https, http
var dbName = window.location.pathname.split('/')[1]; // e.g. rp, rp
var subName = window.location.pathname.split('/')[2]; // e.g. rp, _design

// Allow for database being located one step in from the main URL
// We check for the location of _design to infer whether or not this is true
//   urlPrefix is the location of the couchdb installation
//     e.g. https://radiopurity.snolab.ca/rp
//   prefix is the bit between the hostname and _design
//     e.g. rp/rp
var urlPrefix = httpType + '://' + window.location.host;
var prefix = dbName;
if (subName.substring(0, 1) !== '_') {
  prefix = prefix + '/' + subName;
  urlPrefix = urlPrefix + '/' + subName;
}
$.couch.urlPrefix = urlPrefix;

var db = $.couch.db(dbName);

var editID;
var editRev;

var localSettings = {
  _id: 'settings',
  max_entries: 40,
  error_email: 'errors@example.com',
  use_lucene: 1
};
var totalRows = 0, searchURL, skip = 0, val = 'all', bookmark;
var thPriority = ['Th', 'Th-232', '232-Th', 'Th232', '232Th'];
var uPriority = ['U', 'U-238', '238-U', 'U238', '238U'];
var loginFlag = 0;

var isotopes = ['Ac-224', 'Ac-226', 'Ac-227', 'Ac-228', 'Ac-229', 'Ac', 'Ag-103', 'Ag-104', 'Ag-105', 'Ag-107', 'Ag-109', 'Ag-111', 'Ag-112', 'Ag-113', 'Ag', 'Al-26', 'Al-27', 'Al', 'Am-237', 'Am-238', 'Am-239', 'Am-240', 'Am-241', 'Am-243', 'Am-244', 'Am-245', 'Am', 'Ar-36', 'Ar-37', 'Ar-38', 'Ar-39', 'Ar-40', 'Ar-41', 'Ar-42', 'Ar', 'As-71', 'As-72', 'As-73', 'As-74', 'As-75', 'As-76', 'As-77', 'As-78', 'As', 'At-207', 'At-208', 'At-209', 'At-210', 'At-211', 'At', 'Au-191', 'Au-192', 'Au-193', 'Au-194', 'Au-195', 'Au-196', 'Au-197', 'Au-198', 'Au-199', 'Au', 'B-10', 'B-11', 'B', 'Ba-126', 'Ba-128', 'Ba-129', 'Ba-130', 'Ba-131', 'Ba-132', 'Ba-133', 'Ba-134', 'Ba-135', 'Ba-136', 'Ba-137', 'Ba-138', 'Ba-139', 'Ba-140', 'Ba', 'Be-10', 'Be-7', 'Be-9', 'Be', 'Bh', 'Bi-201', 'Bi-202', 'Bi-203', 'Bi-204', 'Bi-205', 'Bi-206', 'Bi-207', 'Bi-208', 'Bi-209', 'Bi-212', 'Bi', 'Bk-243', 'Bk-244', 'Bk-245', 'Bk-246', 'Bk-247', 'Bk-248', 'Bk-249', 'Bk-250', 'Bk', 'Br-75', 'Br-76', 'Br-77', 'Br-79', 'Br-81', 'Br-82', 'Br-83', 'Br', 'C-12', 'C-13', 'C-14', 'C', 'Ca-40', 'Ca-41', 'Ca-42', 'Ca-43', 'Ca-44', 'Ca-45', 'Ca-46', 'Ca-47', 'Ca-48', 'Ca', 'Cd-106', 'Cd-107', 'Cd-108', 'Cd-109', 'Cd-110', 'Cd-111', 'Cd-112', 'Cd-113', 'Cd-114', 'Cd-116', 'Cd', 'Ce-132', 'Ce-134', 'Ce-135', 'Ce-136', 'Ce-138', 'Ce-139', 'Ce-140', 'Ce-141', 'Ce-142', 'Ce-143', 'Ce-144', 'Ce', 'Cf-246', 'Cf-247', 'Cf-248', 'Cf-249', 'Cf-250', 'Cf-251', 'Cf-252', 'Cf-253', 'Cf-254', 'Cf-255', 'Cf', 'Cl-35', 'Cl-36', 'Cl-37', 'Cl', 'Cm-238', 'Cm-239', 'Cm-240', 'Cm-241', 'Cm-242', 'Cm-243', 'Cm-244', 'Cm-245', 'Cm-246', 'Cm-247', 'Cm-248', 'Cm-249', 'Cm-250', 'Cm-252', 'Cm', 'Cn', 'Co-55', 'Co-56', 'Co-57', 'Co-58', 'Co-59', 'Co-60', 'Co-61', 'Co', 'Cr-48', 'Cr-50', 'Cr-51', 'Cr-52', 'Cr-53', 'Cr-54', 'Cr', 'Cs-127', 'Cs-129', 'Cs-131', 'Cs-132', 'Cs-133', 'Cs-134', 'Cs-135', 'Cs-136', 'Cs-137', 'Cs', 'Cu-61', 'Cu-63', 'Cu-64', 'Cu-65', 'Cu-67', 'Cu', 'Db-267', 'Db-268', 'Db-269', 'Db', 'Ds', 'Dy-152', 'Dy-153', 'Dy-154', 'Dy-155', 'Dy-156', 'Dy-157', 'Dy-158', 'Dy-159', 'Dy-160', 'Dy-161', 'Dy-162', 'Dy-163', 'Dy-164', 'Dy-165', 'Dy-166', 'Dy', 'Er-158', 'Er-160', 'Er-161', 'Er-162', 'Er-163', 'Er-164', 'Er-165', 'Er-166', 'Er-167', 'Er-168', 'Er-169', 'Er-170', 'Er-171', 'Er-172', 'Er', 'Es-249', 'Es-250', 'Es-251', 'Es-252', 'Es-253', 'Es-254', 'Es-255', 'Es-257', 'Es', 'Eu-145', 'Eu-146', 'Eu-147', 'Eu-148', 'Eu-149', 'Eu-150', 'Eu-151', 'Eu-152', 'Eu-153', 'Eu-154', 'Eu-155', 'Eu-156', 'Eu-157', 'Eu', 'F-18', 'F-19', 'F', 'Fe-52', 'Fe-54', 'Fe-55', 'Fe-56', 'Fe-57', 'Fe-58', 'Fe-59', 'Fe-60', 'Fe', 'Fl', 'Fm-251', 'Fm-252', 'Fm-253', 'Fm-254', 'Fm-255', 'Fm-256', 'Fm-257', 'Fm', 'Fr', 'Ga-66', 'Ga-67', 'Ga-68', 'Ga-69', 'Ga-71', 'Ga-72', 'Ga-73', 'Ga', 'Gd-146', 'Gd-147', 'Gd-148', 'Gd-149', 'Gd-150', 'Gd-151', 'Gd-152', 'Gd-153', 'Gd-154', 'Gd-155', 'Gd-156', 'Gd-157', 'Gd-158', 'Gd-159', 'Gd-160', 'Gd', 'Ge-66', 'Ge-68', 'Ge-69', 'Ge-70', 'Ge-71', 'Ge-72', 'Ge-73', 'Ge-74', 'Ge-75', 'Ge-76', 'Ge-77', 'Ge-78', 'Ge', 'H-1', 'H-2', 'H-3', 'H', 'He-3', 'He-4', 'He', 'Hf-170', 'Hf-171', 'Hf-172', 'Hf-173', 'Hf-174', 'Hf-175', 'Hf-176', 'Hf-177', 'Hf-178', 'Hf-179', 'Hf-180', 'Hf-181', 'Hf-182', 'Hf-183', 'Hf-184', 'Hf', 'Hg-192', 'Hg-194', 'Hg-196', 'Hg-197', 'Hg-198', 'Hg-199', 'Hg-200', 'Hg-201', 'Hg-202', 'Hg-203', 'Hg-204', 'Hg', 'Ho-161', 'Ho-163', 'Ho-165', 'Ho-167', 'Ho', 'Hs', 'I-120', 'I-121', 'I-123', 'I-124', 'I-125', 'I-126', 'I-127', 'I-129', 'I-130', 'I-131', 'I-132', 'I-133', 'I-135', 'I', 'In-109', 'In-110', 'In-111', 'In-113', 'In-115', 'In', 'Ir-184', 'Ir-185', 'Ir-186', 'Ir-187', 'Ir-188', 'Ir-189', 'Ir-190', 'Ir-191', 'Ir-193', 'Ir', 'K-39', 'K-40', 'K-41', 'K-42', 'K-43', 'K', 'Kr-76', 'Kr-77', 'Kr-78', 'Kr-79', 'Kr-80', 'Kr-81', 'Kr-82', 'Kr-83', 'Kr-84', 'Kr-85', 'Kr-86', 'Kr-87', 'Kr-88', 'Kr', 'La-132', 'La-133', 'La-135', 'La-137', 'La-138', 'La-139', 'La-140', 'La-141', 'La-142', 'La', 'Li-6', 'Li-7', 'Li', 'Lr-262', 'Lr', 'Lu-169', 'Lu-170', 'Lu-171', 'Lu-172', 'Lu-173', 'Lu-174', 'Lu-175', 'Lu-176', 'Lu-179', 'Lu', 'Lv', 'Md-256', 'Md-257', 'Md-258', 'Md-259', 'Md-260', 'Md', 'Mg-24', 'Mg-25', 'Mg-26', 'Mg-28', 'Mg', 'Mn-52', 'Mn-53', 'Mn-54', 'Mn-55', 'Mn-56', 'Mn', 'Mo-100', 'Mo-90', 'Mo-92', 'Mo-93', 'Mo-94', 'Mo-95', 'Mo-96', 'Mo-97', 'Mo-98', 'Mo-99', 'Mo', 'Mt', 'N-14', 'N-15', 'N', 'Na-22', 'Na-23', 'Na-24', 'Na', 'Nb-89', 'Nb-90', 'Nb-91', 'Nb-92', 'Nb-93', 'Nb-94', 'Nb-95', 'Nb-96', 'Nb-97', 'Nb', 'Nd-138', 'Nd-140', 'Nd-141', 'Nd-142', 'Nd-143', 'Nd-144', 'Nd-145', 'Nd-146', 'Nd-147', 'Nd-148', 'Nd-149', 'Nd-150', 'Nd', 'Ne-20', 'Ne-21', 'Ne-22', 'Ne', 'Ni-56', 'Ni-57', 'Ni-58', 'Ni-59', 'Ni-60', 'Ni-61', 'Ni-62', 'Ni-63', 'Ni-64', 'Ni-65', 'Ni-66', 'Ni', 'No', 'Np-234', 'Np-235', 'Np-236', 'Np-237', 'Np-238', 'Np-239', 'Np-240', 'Np', 'O-16', 'O-17', 'O-18', 'O', 'Os-181', 'Os-182', 'Os-183', 'Os-184', 'Os-185', 'Os-186', 'Os-187', 'Os-188', 'Os-189', 'Os-190', 'Os-191', 'Os-192', 'Os-193', 'Os-194', 'Os', 'P-31', 'P-32', 'P-33', 'P', 'Pa-228', 'Pa-229', 'Pa-230', 'Pa-231', 'Pa-232', 'Pa-233', 'Pa-234', 'Pa-239', 'Pa', 'Pb-198', 'Pb-199', 'Pb-200', 'Pb-201', 'Pb-202', 'Pb-203', 'Pb-204', 'Pb-205', 'Pb-206', 'Pb-207', 'Pb-208', 'Pb-209', 'Pb-210', 'Pb-212', 'Pb', 'Pd-100', 'Pd-101', 'Pd-102', 'Pd-103', 'Pd-104', 'Pd-105', 'Pd-106', 'Pd-107', 'Pd-108', 'Pd-109', 'Pd-110', 'Pd-112', 'Pd', 'Pm-143', 'Pm-144', 'Pm-145', 'Pm-146', 'Pm-147', 'Pm-149', 'Pm-150', 'Pm-151', 'Pm', 'Po-204', 'Po-205', 'Po-206', 'Po-207', 'Po-208', 'Po-209', 'Po-210', 'Po', 'Pr-137', 'Pr-139', 'Pr-141', 'Pr-142', 'Pr-143', 'Pr-145', 'Pr', 'Pt-185', 'Pt-186', 'Pt-187', 'Pt-188', 'Pt-189', 'Pt-190', 'Pt-191', 'Pt-192', 'Pt-193', 'Pt-194', 'Pt-195', 'Pt-196', 'Pt-197', 'Pt-198', 'Pt-200', 'Pt-202', 'Pt', 'Pu-234', 'Pu-236', 'Pu-237', 'Pu-238', 'Pu-239', 'Pu-240', 'Pu-241', 'Pu-242', 'Pu-243', 'Pu-244', 'Pu-245', 'Pu-246', 'Pu-247', 'Pu', 'Ra-223', 'Ra-224', 'Ra-225', 'Ra-226', 'Ra-228', 'Ra-230', 'Ra', 'Rb-81', 'Rb-83', 'Rb-84', 'Rb-85', 'Rb-86', 'Rb-87', 'Rb', 'Re-181', 'Re-182', 'Re-183', 'Re-185', 'Re-187', 'Re-188', 'Re-189', 'Re', 'Rf-265', 'Rf-266', 'Rf-267', 'Rf', 'Rg', 'Rh-100', 'Rh-101', 'Rh-103', 'Rh-105', 'Rh-99', 'Rh', 'Rn-210', 'Rn-211', 'Rn-222', 'Rn-224', 'Rn', 'Ru-100', 'Ru-101', 'Ru-102', 'Ru-103', 'Ru-104', 'Ru-105', 'Ru-106', 'Ru-95', 'Ru-96', 'Ru-97', 'Ru-98', 'Ru-99', 'Ru', 'S-32', 'S-33', 'S-34', 'S-35', 'S-36', 'S-38', 'S', 'Sb-117', 'Sb-119', 'Sb-121', 'Sb-122', 'Sb-123', 'Sb-124', 'Sb-125', 'Sb-126', 'Sb-127', 'Sb-128', 'Sb-129', 'Sb', 'Sc-43', 'Sc-45', 'Sc-46', 'Sc-47', 'Sc-48', 'Sc', 'Se-72', 'Se-73', 'Se-74', 'Se-75', 'Se-76', 'Se-77', 'Se-78', 'Se-79', 'Se-80', 'Se-82', 'Se', 'Sg', 'Si-28', 'Si-29', 'Si-30', 'Si-31', 'Si-32', 'Si', 'Sm-142', 'Sm-144', 'Sm-145', 'Sm-146', 'Sm-147', 'Sm-148', 'Sm-149', 'Sm-150', 'Sm-151', 'Sm-152', 'Sm-153', 'Sm-154', 'Sm-156', 'Sm', 'Sn-110', 'Sn-112', 'Sn-113', 'Sn-114', 'Sn-115', 'Sn-116', 'Sn-117', 'Sn-118', 'Sn-119', 'Sn-120', 'Sn-122', 'Sn-123', 'Sn-124', 'Sn-125', 'Sn-126', 'Sn-127', 'Sn', 'Sr-80', 'Sr-82', 'Sr-83', 'Sr-84', 'Sr-85', 'Sr-86', 'Sr-87', 'Sr-88', 'Sr-89', 'Sr-90', 'Sr-91', 'Sr-92', 'Sr', 'Ta-173', 'Ta-174', 'Ta-175', 'Ta-176', 'Ta-177', 'Ta-179', 'Ta-181', 'Ta-182', 'Ta-183', 'Ta-184', 'Ta', 'Tb-147', 'Tb-148', 'Tb-149', 'Tb-150', 'Tb-151', 'Tb-152', 'Tb-153', 'Tb-155', 'Tb-156', 'Tb-157', 'Tb-158', 'Tb-159', 'Tb-160', 'Tb-161', 'Tb', 'Tc-93', 'Tc-94', 'Tc-96', 'Tc-97', 'Tc-98', 'Tc-99', 'Tc', 'Te-116', 'Te-117', 'Te-118', 'Te-120', 'Te-122', 'Te-123', 'Te-123', 'Te-124', 'Te-125', 'Te-126', 'Te-128', 'Te-130', 'Te-132', 'Te', 'Th-227', 'Th-228', 'Th-229', 'Th-230', 'Th-231', 'Th-232', 'Th-234', 'Th', 'Ti-44', 'Ti-45', 'Ti-46', 'Ti-47', 'Ti-48', 'Ti-49', 'Ti-50', 'Ti', 'Tl-195', 'Tl-196', 'Tl-197', 'Tl-198', 'Tl-199', 'Tl-200', 'Tl-201', 'Tl-202', 'Tl-203', 'Tl-204', 'Tl-205', 'Tl', 'Tm-163', 'Tm-165', 'Tm-166', 'Tm-167', 'Tm-168', 'Tm-169', 'Tm-170', 'Tm-171', 'Tm-172', 'Tm-173', 'Tm', 'U-230', 'U-231', 'U-232', 'U-233', 'U-234', 'U-235', 'U-236', 'U-237', 'U-238', 'U-240', 'U (early)', 'U (late)', 'U', 'Uuo', 'Uup', 'Uus', 'Uut', 'V-48', 'V-49', 'V-50', 'V-51', 'V', 'W-176', 'W-177', 'W-178', 'W-180', 'W-181', 'W-182', 'W-183', 'W-184', 'W-185', 'W-186', 'W-187', 'W-188', 'W', 'Xe-122', 'Xe-123', 'Xe-124', 'Xe-125', 'Xe-126', 'Xe-127', 'Xe-128', 'Xe-129', 'Xe-130', 'Xe-131', 'Xe-132', 'Xe-133', 'Xe-134', 'Xe-135', 'Xe-136', 'Xe', 'Y-86', 'Y-87', 'Y-88', 'Y-89', 'Y-90', 'Y-91', 'Y-92', 'Y-93', 'Y', 'Yb-164', 'Yb-166', 'Yb-168', 'Yb-169', 'Yb-170', 'Yb-171', 'Yb-172', 'Yb-173', 'Yb-174', 'Yb-175', 'Yb-176', 'Yb-177', 'Yb-178', 'Yb', 'Zn-62', 'Zn-64', 'Zn-65', 'Zn-66', 'Zn-67', 'Zn-68', 'Zn-70', 'Zn-72', 'Zn', 'Zr-86', 'Zr-87', 'Zr-88', 'Zr-89', 'Zr-90', 'Zr-91', 'Zr-92', 'Zr-93', 'Zr-94', 'Zr-95', 'Zr-96', 'Zr-97', 'Zr'];
var methods = ['Ge', 'ICP-MS', 'NAA', 'Alpha'];
var units = ["pct", "g/g",
  "ppm", "ppb", "ppt", "ppq",
  "Bq", "Bq/kg",   "Bq/unit",  "Bq/m",  "Bq/cm",  "Bq/m2",  "Bq/cm2",
  "mBq", "mBq/kg", "mBq/unit", "mBq/m", "mBq/cm", "mBq/m2", "mBq/cm2",
  "uBq", "uBq/kg", "uBq/unit", "uBq/m", "uBq/cm", "uBq/m2", "uBq/cm2",
  "nBq", "nBq/kg", "nBq/unit", "nBq/m", "nBq/cm", "nBq/m2", "nBq/cm2",
  "pBq", "pBq/kg", "pBq/unit", "pBq/m", "pBq/cm", "pBq/m2", "pBq/cm2",
  "g",   "g/kg",   "g/unit",   "g/m",   "g/cm",   "g/m2",   "g/cm2",
  "mg",  "mg/kg",  "mg/unit",  "mg/m",  "mg/cm",  "mg/m2",  "mg/cm2",
  "ug",  "ug/kg",  "ug/unit",  "ug/m",  "ug/cm",  "ug/m2",  "ug/cm2",
  "ng",  "ng/kg",  "ng/unit",  "ng/m",  "ng/cm",  "ng/m2",  "ng/cm2",
  "pg",  "pg/kg",  "pg/unit",  "pg/m",  "pg/cm",  "pg/m2",  "pg/cm2"];
var types = [
  'Meas.', 'Meas. (error)', 'Meas. (asym. error)',
  'Limit', 'Limit (c.l.)',
  'Range', 'Range (c.l.)'
];
var utypes = [
  'string', 'number'
];

/** Search. */
function searchResults(val, options) {
  var material = $('#materials');
  material.empty();
  $('#status-line').empty();
  $('.table-header').show();

  var nEntries;
  skip = 0;
  totalRows = 0;

  useLucene = false;
  searchAddress = '_search/heading';
  ftiPrefix = '/';

  if (localSettings.use_lucene == 1) {
    useLucene = true;
    searchAddress = 'search';
    ftiPrefix = '/_fti/local/'
  }

  searchURL = urlPrefix + ftiPrefix + dbName + '/_design/persephone/' +
    searchAddress + '?q=' + val + '&limit=' + localSettings.max_entries;

  if (val.toLowerCase() === 'all') {
    searchURL = '/' + prefix + '/_design/persephone/_view/query-by-group' +
    '?limit=' + localSettings.max_entries;
  }

  $.ajax({
    url: searchURL,
    dataType: 'json',
    async: false,
    success: function (data) {
      totalRows = data.total_rows;
      $('#status-line').append('Total results: ' + data.total_rows);
      if (data.total_rows > 0) {
        if (data.total_rows > localSettings.max_entries) {
          nEntries = localSettings.max_entries;
        } else {
          nEntries = data.total_rows;
        }
        // Bookmark for infinite scrolling
        if (data.bookmark) {
          bookmark = data.bookmark;
        }
        var doc;
        var j;
        for (j = 0; j < nEntries; j++) {
          if (val.toLowerCase() != 'all') {
            doc = data.rows[j].fields;
            doc["id"] = data.rows[j].id;
          } else {
            doc = data.rows[j].value;
          }
          fillHeading(doc, material);
        }
        decorateResult();
        material.infiniScroll('pollLevel');
      }
    }
  })
};

/** Enter search box. */
function enter_box(event) {
  if (event.keyCode == 13) {
    click_search();
    event.returnValue = false; // for IE
    if (event.preventDefault()) event.preventDefault();
  }
  return false;
}

/** Click search. */
function click_search() {
  var entry = $('#box-search').val();
  val = entry;
  if (entry === '' || entry === 'e.g. all') {
    $('#box-search').focus();
    $('#materials').empty();
    $('#status-line').empty();
    $('.table-header').hide();
    totalRows = 0;
    skip = 0;
    return false;
  }
  var options = {}
  searchResults(entry, options);
  return false;
};

/** Comment. */
buttonFade = function () {
  var parent = $(this).closest('div');
  parent.find('.detail-button').fadeToggle();
  parent.find('.export-button').fadeToggle();
  parent.find('.heading-isotope-name-short').toggle();
};

/** Decorate the results of the search. */
function decorateResult () {

  $('#materials > div').accordion( {
    header: 'h3',
    navigation: true,
    collapsible: true,
    heightStyle: 'content',
    create: function(event) {
      $(event.target).accordion('activate', false);
    }
  });

  $('#materials').sortable({axis: 'y', handle: 'h3'});

  $('.delete-button').button({
    icons: {primary:'ui-icon-close'},
    text: false,
  }).click(function(event) {
    event.stopPropagation(); // this is
    event.preventDefault(); // the magic
    var parent = $(this).closest('div');
    var head = parent.prev('h3');
    parent.add(head).hide(function() {$(this).remove();});
  });

  $('.detail-button').button({
    icons:{primary:'ui-icon-zoomin'},
    text:false
  }).unbind().click(function(event) {
    var parent = $(this).closest('div');
    if ($(this).hasClass('none-preloading')) {
      $(this).removeClass('none-preloading');
      var url = window.location.protocol + '//' + window.location.host +
                '/' + prefix + '/' + $(this).attr('value');
      $.ajax({
        url: url,
        dataType: 'json',
        async: false,
        success: function(data) {
          fillDetail(data, parent.find('.accordion-details #meas-info'));
        },
        error: function(jqXHR, textStatus, errorThrown){
          alert('Error' + textStatus + ':'+errorThrown);
        }
      });
    }
    event.stopPropagation(); // this is
    event.preventDefault(); // the magic
    parent.find('.hideable').fadeToggle();
    $('.ui-button-icon-primary', this)
      .toggleClass('ui-icon-zoomin ui-icon-zoomout');
  });

  $('.export-button').button({
    icons:{primary:'ui-icon-wrench'},
    text:false
  });

  $('.export-button').unbind('click').click(function(event){
    event.stopPropagation(); // prevent triggering of accordian
    event.preventDefault();
    var options = $(this).closest('div').find('.export-option');
    if ( options.is(':visible') ) {
      options.fadeOut(100);
    } else {
      options.fadeIn(100);
    };
  });

  $('.export-option').menu();

  if(!loginFlag){
    // disable the edit function
    $('.edit-menu').addClass('ui-state-disabled');
  }

  $('.export-json').unbind('click').click(function (event) {
    var parent = $(this).closest('.accordion');
    var url = window.location.protocol + '//' + window.location.host +
              '/' + prefix + '/' + parent.attr('value');
    saveToDisk(url, parent.attr('value')+'.json');
  });

  $('.export-xml').unbind('click').click(function () {
    var parent = $(this).closest('.accordion');
    var url = window.location.protocol + '//' + window.location.host +
              '/' + prefix +
              '/_design/persephone/_list/exportXML/assay.xml?_id=' +
              parent.attr('value');
    saveToDisk(url, parent.attr('value')+'.xml');
  });

  $('.export-html').unbind('click').click(function () {
      var parent = $(this).closest('.accordion');
      var url = window.location.protocol + '//' + window.location.host +
                '/' + prefix +
                '/_design/persephone/_list/exportHTML/assay.xml?_id=' +
                parent.attr('value');
      saveToDisk(url, parent.attr('value')+'.html');
  });

  $('.export-csv').unbind('click').click(function () {
      var parent = $(this).closest('.accordion');
      var url = window.location.protocol + '//' + window.location.host +
                '/' + prefix +
                "/_design/persephone/_list/exportCSV/assay.csv?idlist=" +
                parent.attr('value') + ']';
      saveToDisk(url, parent.attr('value')+'.csv');
  });

  $('.edit-assay').unbind('click').bind('click' , function () {
      var parent = $(this).closest('.accordion');
      var id = parent.attr('value');
      editAssay(id, 'update');
  });

  $('.clone-assay').unbind('click').bind('click' , function () {
      var parent = $(this).closest('.accordion');
      var id = parent.attr('value');
      editAssay(id, 'clone');
  });

  $('h3').unbind('click',buttonFade).bind('click', buttonFade);
  $('.faded').highlight('email').highlight('url');

};

/** Fill the JSON into the details_output.html. */
function fillDetail(doc, material) {
  doc.error_email = localSettings.error_email;
  var tt = $.tmpl('details_output', doc);
  material.html(tt);
}

/** Fill the JSON into the heading_template.html. */
function fillHeading(doc, material) {
  var pri_th = 100;
  var pri_u = 100;
  var thi = -1;
  var ui = -1;
  doc.results = [];
  if (typeof(doc.isotope) != 'undefined') {
    for (var k in doc.isotope) {
      doc.results.push({
        isotope: doc.isotope[k],
        result1: doc.result1[k],
        result2: doc.result2[k],
        type: doc.type[k],
        unit: doc.unit[k]
      });
      var item = doc.isotope[k];
      if (item.indexOf('Th') > -1 && doc.unit[k] != 'ng/cm2' && doc.unit[k] !=
        'pg/cm2') {
        for (var i = 0; i < thPriority.length; i++) {
          if (item == thPriority[i] && i < pri_th) {
            thi = k;
            pri_th = i;
          }
        }
      }
      if (item.indexOf('U') > -1 && doc.unit[k] != 'ng/cm2' && doc.unit[k] !=
        'pg/cm2') {
        for (var i = 0; i < uPriority.length; i++) {
          if (item == uPriority[i] && i < pri_u) {
            ui = k;
            pri_u = i;
          }
        }
      }
    }
  } else {
    doc.isotope = [];
  }
  if (thi != -1) {
    th = {
      isotope: doc.isotope[thi],
      'result1': doc.result1[thi],
      'result2': doc.result2[thi],
      type: doc.type[thi],
      'unit': doc.unit[thi]
    };
  } else {
    th = {
      isotope: '',
      'result1': '',
      'result2': '',
      'unit': '',
      type: ''
    };
  }
  if (ui != -1) {
    u = {
      isotope: doc.isotope[ui],
      'result1': doc.result1[ui],
      'result2': doc.result2[ui],
      type: doc.type[ui],
      'unit': doc.unit[ui]
    };
  } else {
    u = {
      isotope: '',
      'result1': '',
      'result2': '',
      'unit': '',
      type: ''
    };
  }
  doc.iso = [th, u];
  doc.error_email = localSettings.error_email;
  var tt = $.tmpl('heading_output', doc);
  material.append(tt);
}

/** Email link. */
function emailLink(user, dom, linkText) {
  return document.write("<a href=" + "mail" + "to:" + user + "@" + dom
   + ">" + linkText + "<\/a>");
}

/**
 * Populate an input form
 *   options = {"doc":fillDoc , "label":pageTab , "method":"update"}
 */
function createAssayPage(options) {
  label = options.label;
  $.get('templates/default_input.html', function(tmp) {

    $.template('input_template', tmp);
    $.tmpl('input_template', null).appendTo(label + '#input-form');

    // Hide all results boxes except those for 'measurement, symmetric error'
    $(label + '.rmeaserrp, ' + label + '.rmeaserrm').hide();
    $(label + '.rlimit, ' + label + '.rlimitcl').hide();
    $(label + '.rrangel, ' + label + '.rrangeh, ' + label + '.rrangecl').hide();

    // Spacers used to align results input boxes
    // This dynamic alignment ensures correct alignment in different browsers
    // Probably just have used a table...
    $(label + '.spacer1').hide().attr('disabled', true);
    $(label + '.spacer2').show().attr('disabled', true);

    // Tooltip positions
    $(label).children().tooltip({
      position: {my: 'left+15 center', at: 'right center' }
    });
    $(label + '#mdate2a').tooltip({
      position: {my: 'left+157 center', at: 'right center' }
    });
    $(label + '#sown1,' + label + '#mreq1,' + label + ' #mprac1,' +
      label + ' #dinp1').tooltip({
        position: {my: 'left+173 center', at: 'right center' }
    });
    $(label + '.add-entry').tooltip({
      position: {my: 'left+48 center', at: 'right center' }
    })

    // Date format switching
    $(label + '.twodate').hide(); // Default to single date

    $(label + '#button-date-sample').button({
      icons:{primary:'ui-icon-refresh'},
      text:false
    });

    $(label + '#button-date-sample').bind('click', function() {
      if ( $(label + '#mdate1').is(':visible') &&
           $(label + '#mdate1').val() != '' ) {
        $(label + '#mdate2a').val($(label + '#mdate1').val());
      } else {
        $(label + '#mdate1').val($(label + '#mdate2a').val());
      }
      $(label + '.onedate').toggle();
      $(label + '.twodate').toggle();
      if ( $(label + '#mdate1').is(':visible') ) {
        $(label + '#mdate1').focus();
      } else {
        $(label + '#mdate2b').focus();
      }
    });

    // Add result line button
    $(label + '.add-entry').button({
      icons: {primary: 'ui-icon-plus'},
      text: false
    })
    $(label + ".add-entry").bind('click', function() {
      var clone = $(label + ".input-template").clone(true)
      .removeClass('input-template').addClass('result-row');
      clone.insertAfter($(this).closest('tr')).show();
    });
    $(label + ".remove-entry").button({
      icons: {primary:"ui-icon-minus"},
      text: false
    });
    $(label + ".remove-entry").click(function() {
      $(this).closest('tr').remove();
    });

    // Buttons for user-defined fields
    $(label + ".button-user-add").button({
      icons: {primary:"ui-icon-plus"},
      text: false
    });
    $(label + ".button-user-add").bind('click', function() {
      var clone = $(label + ".user-input-template").clone(true)
      .removeClass('user-input-template').addClass('row-user-sample');
      clone.insertAfter($(this).closest('tr')).show();
    });
    $(label + ".button-user-remove").button({
      icons:{primary: "ui-icon-minus"},
      text:false
    });
    $(label + ".button-user-remove").click(function() {
      $(this).closest('tr').remove();
    });

    // Form validation
    $(label + '#input').validate({
      rules: {
        grp: 'required',
        sname: 'required',
        dref: 'required',
        dinp1: 'required',
        dinp2: 'required',
        dinp3: {required:true, dateISO:true},
        mdate1: {dateISO:true},
        mdate2a: {dateISO:true},
        mdate2b: {dateISO:true}
      },
      messages: {
        grp: 'required',
        sname: 'required',
        dref: 'required',
        dinp1: 'required',
        dinp2: 'required',
        dinp3: {
          required: 'required',
          dateISO: "Invalide date format"
        },
        mdate1: {dateISO: "Invalide date format"},
        mdate2a: {dateISO: "Invalide date format"},
        mdate2b: {dateISO: "Invalide date format"}
      },
      errorPlacement: function(error, element) {
        element.nextAll('.istatus').empty();
        error.appendTo(element.nextAll('.istatus'));
      }
    });

    // Autocomplete functions
    $(label + ".risotope").bind('focus', function() {
      $(this).autocomplete({source:isotopes, minLength:0});
      $(this).autocomplete('search', '');
    });

    $(label + ".runit").bind('focus', function() {
      $(this).autocomplete({source:units, minLength:0,
        change: function (event, ui) {
        if (!ui.item) { $(this).val(''); $(this).focus() }
        }
      });
      $(this).autocomplete('search', '');
    });

    $(label + ".utype").bind('focus', function() {
      $(this).autocomplete({source:utypes, minLength:0,
        change: function (event, ui) {
        if (!ui.item) { $(this).val(''); $(this).focus() }
        }
      });
      $(this).autocomplete('search', '');
    });

    $(label + "#mtech").bind('focus', function() {
      $(this).autocomplete({source:methods, minLength:0});
      $(this).autocomplete('search', '');
    });

    // Handle change to result type
    $(label + ".rtype").bind('focus', function() {
      $(this).autocomplete({
        source:types,
        minLength:0,
        change: function(event, ui) {

          if (!ui.item) {
            $(this).val(types[1])
          }

          $(this).nextAll('.rmeas, .rmeaserr, .rmeaserrp, .rmeaserrm').hide();
          $(this).nextAll('.rlimit, .rlimitcl').hide();
          $(this).nextAll('.rrangel, .rrangeh, .rrangecl').hide();

          var spacers = 1;

          var cache_meas = $(this).nextAll('.rmeas').val();
          var cache_limit = $(this).nextAll('.rlimit').val();

          if ($(this).val() == types[0]) {
            $(this).nextAll('.rmeas').show().focus();
            if (cache_limit != '') { $(this).nextAll('.rmeas').val(cache_limit) };
            spacers = 2;
          } else if ($(this).val() == types[1]) {
            $(this).nextAll('.rmeas, .rmeaserr').show();
            $(this).nextAll('.rmeas').focus();
            if (cache_limit != '') { $(this).nextAll('.rmeas').val(cache_limit) };
          } else if ($(this).val() == types[2]) {
            $(this).nextAll('.rmeas, .rmeaserrp, .rmeaserrm').show();
            $(this).nextAll('.rmeas').focus();
            if (cache_limit != '') { $(this).nextAll('.rmeas').val(cache_limit) };
            spacers = 0;
          } else if ($(this).val() == types[3]) {
            $(this).nextAll('.rlimit').show();
            $(this).nextAll('.rlimit').focus();
            if (cache_meas != '') { $(this).nextAll('.limit').val(cache_meas) };
            spacers = 2;
          } else if ($(this).val() == types[4]) {
            $(this).nextAll('.rlimit, .rlimitcl').show();
            $(this).nextAll('.rlimit').focus();
            if ( cache_meas != '' ) { $(this).nextAll('.limit').val(cache_meas) };
          } else if ( $(this).val() == types[5] ) {
            $(this).nextAll('.rrangel, .rrangeh').show();
            $(this).nextAll('.rrangel').focus();
          } else if ( $(this).val() == types[6] ) {
            $(this).nextAll('.rrangel, .rrangeh, .rrangecl').show();
            $(this).nextAll('.rrangel').focus();
            spacers = 0;
          } else {
            $(this).val() == "Meas. (error)";
            $(this).nextAll('.rmeas, .rmeaserr').show();
            $(this).nextAll('.rmeas').focus();
          }

          if (spacers === 0) {
            $(this).nextAll(".spacer1").hide().attr('disabled', true);
            $(this).nextAll(".spacer2").hide().attr('disabled', true);
          } else if (spacers === 1) {
            $(this).nextAll(".spacer1").hide().attr('disabled', true);
            $(this).nextAll(".spacer2").show().attr('disabled', true);
          } else {
            $(this).nextAll(".spacer1").show().attr('disabled', true);
            $(this).nextAll(".spacer2").show().attr('disabled', true);
          }

        }
      });

      $(this).autocomplete('search', '');
    });

    //  initial submit button
    $(label + "#button-clear1").button();
    $(label + "#button-clear2").button();
    $(label + "#button-check").button();
    $(label + "#button-delete").button();
    $(label + "#button-submit").button();
    $(label + "#button-edit").button();
    if (options.method == "update") {
      $(label + "#button-submit").button().hide();
      $(label + "#button-edit").button().show();
    } else if(options.method == "clone"){
      $(label + "#button-edit").button().hide();
      $(label + "#button-submit").button().show();
    }
    $(label + "input:text:visible:first").focus();

    // Have content to fill
    if (options.doc) {
      FillEditBlank(label, options.doc);
    }
  });

}

/** Clear submit/edit form. */
function clickClearAll(label) {
  $(':input', label + ' #input').not(':button, :submit, :reset, :hidden').val(
    '').removeAttr('checked').removeAttr('selected');
  $(label + ' #input').validate().resetForm()
  $("div.ui-tooltip").remove();
}

/** Clear warnings from submit/edit form. */
function clickClearWarnings(label) {
  $(label + ' #input').validate().resetForm()
  $("div.ui-tooltip").remove();
}

/** Check submit/edit form. */
function clickCheck(label) {
  $(label + ' #input').validate().form()
  $("div.ui-tooltip").remove();
}

/** Comment. */
function dbDelete() {
  doc = {_id: editID, _rev: editRev, _deleted: true};
  db.saveDoc(doc , {
      success: function() {
        $('#tab-edit #input-form').empty();
        $('.div-edit').hide();
        editID = '';
        editRev = '';
        $( '#tabs' ).tabs({ active: 0 });
      },
      error: function(jqXHR, textStatus, errorThrown){
        alert('Error'+textStatus+':'+errorThrown);
      }
    }
  );
}

/** Remove assay from display. */
function clickDelete(options) {
  $(options.dialog).dialog({
    modal: true,
    buttons: {
      'Yes': function() {
        dbDelete();
        $(this).dialog('close');
      },
      'No': function() {
        $(this).dialog('close');
      }
    }
  });
  $(options.dialog).empty();
  $(options.dialog).append('<p>Are you sure to delete this measurement?</p>');
  $(options.dialog).dialog('open' );
}

/** Submit Assays. */
// options = {"label":"tab-submit", "dialog":"#dialog-submit ", "method":"update"}
function clickSubmit(options) {
  label = options.label;
  $(label + ' #input').validate().form();
  if ( $(label + " #input").validate().numberOfInvalids() == 0 ) {
    // Build the JSON for the results block
    var result = [];
    // Loop through all the results for this measurement
    $(label + " .result-row").each(function() {
      var risotope = $(this).find(".risotope").val();
      var rtype = $(this).find(".rtype").val();
      var runit = $(this).find(".runit").val();
      // Measurement
      if (risotope != "" && rtype != "") {
        // "Meas."
        if (rtype === types[0]) {
          var rvalue = $(this).find(".rmeas").val();
          result.push({
            isotope: risotope,
            type: "measurement",
            "value": [parseFloat(rvalue)],
            "unit": runit
          });
        }
        // "Meas. (error)"
        else if( rtype == types[1] ){
          var rvalue = $(this).find(".rmeas").val();
          var rmeaserr = $(this).find(".rmeaserr").val();
          result.push({
            isotope: risotope,
            type: "measurement",
            "value": [parseFloat(rvalue),parseFloat(rmeaserr)],
            "unit": runit
          });
        }
        // "Meas. (asym. error)"
        else if( rtype == types[2] ){
          var rvalue = $(this).find(".rmeas").val();
          var rmeaserrp = $(this).find(".rmeaserrp").val();
          var rmeaserrm = $(this).find(".rmeaserrm").val();
          result.push({
            isotope: risotope,
            type: "measurement",
            value: [parseFloat(rvalue),parseFloat(rmeaserrp),parseFloat(rmeaserrm)],
            unit: runit
          });
        }
        // "Limit"
        else if( rtype == types[3] ){
          var rlimit = $(this).find(".rlimit").val();
          result.push({
            isotope: risotope,
            type: "limit",
            value: [parseFloat(rlimit)],
            unit: runit
          });
        }
        // "Limit (c.l.)"
        else if( rtype == types[4] ){
          var rlimit = $(this).find('.rlimit').val();
          var rlimitcl = $(this).find('.rlimitcl').val();
          result.push({
            isotope: risotope,
            type: 'limit',
            value: [parseFloat(rlimit),parseFloat(rlimitcl)],
            unit: runit
          });
        }
        // "Range"
        else if( rtype == types[5] ){
          var rrangel = $(this).find(".rrangel").val();
          var rrangeh = $(this).find(".rrangeh").val();
          result.push({
            isotope: risotope,
            type: "range",
            value: [parseFloat(rrangel),parseFloat(rrangeh)],
            unit: runit
          });
        }
        // "Range (c.l.)"
        else if( rtype == types[6] ){
          var rrangel = $(this).find(".rrangel").val();
          var rrangeh = $(this).find(".rrangeh").val();
          var rrangecl = $(this).find(".rrangecl").val();
          result.push({
            isotope: risotope,
            type: "range",
            value: [parseFloat(rrangel),parseFloat(rrangeh),parseFloat(rrangecl)],
            unit: runit
          });
        }
      }
    });

    // Build the JSON for the user block
    var suser = [];
    var muser = [];
    var duser = [];

    // Loop through sample user
    $(label + '.sample-input .row-user-sample').each(function() {
      var uname = $(this).find('.uname').val();
      var udesc = $(this).find('.udesc').val();
      var utype = $(this).find('.utype').val();
      var uvalue = $(this).find('.uvalue').val();
      var uunit = $(this).find('.uunit').val();

      if (utype === 'number') {
        suser.push({
          name: uname,
          description: udesc,
          type: utype,
          value: [parseFloat(uvalue)],
          unit: uunit
        });
      } else {
        suser.push({
          name: uname,
          description: udesc,
          type: utype,
          value: uvalue,
          unit: uunit
        });
      }

    });

    // Loop through measurement user
    $(label + '.measurement-input .row-user-sample').each(function(){
      var uname = $(this).find('.uname').val();
      var udesc = $(this).find('.udesc').val();
      var utype = $(this).find('.utype').val();
      var uvalue = $(this).find('.uvalue').val();
      var uunit = $(this).find('.uunit').val();

      if (utype === 'number') {
        muser.push({
          name: uname,
          description: udesc,
          type: utype,
          value: [parseFloat(uvalue)],
          unit: uunit
        });
      } else {
        muser.push({
          name: uname,
          description: udesc,
          type: utype,
          value: uvalue,
          unit: uunit
        });
      }

    });

    // Loop through data source user
    $(label + '.data-input .row-user-sample').each(function(){
      var uname  = $(this).find('.uname').val();
      var udesc  = $(this).find('.udesc').val();
      var utype  = $(this).find('.utype').val();
      var uvalue = $(this).find('.uvalue').val();
      var uunit  = $(this).find('.uunit').val();

      if (utype === 'number') {
        duser.push({
          name: uname,
          description: udesc,
          type: utype,
          value: [parseFloat(uvalue)],
          unit: uunit
        });
      } else {
        duser.push({
          name: uname,
          description: udesc,
          type: utype,
          value: uvalue,
          unit: uunit
        });
      }

    });

    // Build the JSON for the mdate block
    var mdate = [];
    if ($(label + ' #mdate1').is(':visible')) {
      mdate = [$(label + ' #mdate1').val()];
    } else {
      mdate = [$(label + ' #mdate2a').val(),label + $(' #mdate2b').val()];
    }

    // Build the overall JSON

    if (options.method === 'update') {

      var output_json = {
        _id: editID,
        _rev: editRev,
        type: 'measurement',
        grouping: $(label + '#grp').val(),
        sample: {
          name: $(label + '#sname').val(),
          description: $(label + '#sdesc').val(),
          id: $(label + '#sid').val(),
          source: $(label + '#ssrc').val(),
          owner: {
            name: $(label + '#sown1').val(),
            contact: $(label + '#sown2').val()
          },
          user: suser
        },
        measurement: {
          institution: $(label + '#minst').val(),
          technique: $(label + '#mtech').val(),
          description: $(label + '#mdesc').val(),
          date: mdate,
          results: result,
          requestor: {
            name: $(label + '#mreq1').val(),
            contact: $(label + '#mreq2').val()
          },
          practitioner: {
            name: $(label + '#mprac1').val(),
            contact: $(label + '#mprac2').val()
          },
          description: $(label + '#mdesc').val(),
          user: muser
        },
        data_source: {
          reference: $(label + '#dref').val(),
          input: {
          name: $(label + '#dinp1').val(),
            contact: $(label + '#dinp2').val(),
            date: $(label + '#dinp3').val()
          },
          notes: $(label + '#dnotes').val(),
          user: duser
        },
        specification: '3.00'
      };

    } else {

      var output_json =       {
        type:'measurement',
        grouping:$(label + '#grp').val(),
        sample: {
          name: $(label + '#sname').val(),
          description: $(label + '#sdesc').val(),
          id: $(label + '#sid').val(),
          source: $(label + '#ssrc').val(),
          owner: {
            name: $(label + '#sown1').val(),
            contact: $(label + '#sown2').val()
          },
          user:suser
        },
        measurement: {
          institution: $(label + '#minst').val(),
          technique: $(label + '#mtech').val(),
          description: $(label + '#mdesc').val(),
          date: mdate,
          results: result,
          requestor: {
            name: $(label + '#mreq1').val(),
            contact: $(label + '#mreq2').val()
          },
          practitioner: {
            name: $(label + '#mprac1').val(),
            contact: $(label + '#mprac2').val()
          },
          description: $(label + '#mdesc').val(),
          user: muser
        },
        data_source: {
          reference: $(label + '#dref').val(),
          input: {
           name: $(label + '#dinp1').val(),
           contact: $(label + '#dinp2').val(),
           date: $(label + '#dinp3').val()
          },
          notes: $(label + '#dnotes').val(),
          user: duser
        },
        specification: '3.00'
      };

    }

    db.saveDoc(output_json, {
      success: function(response, textStatus, jqXHR) {
        $("div.ui-tooltip").remove();
        if (options.dialog == "#dialog-submit") {
          $(options.dialog).dialog({
            modal: true,
            buttons: {
              "Clear": function() {
                $(this).dialog("close");
                clickClearAll(label);
                $("#tabs").tabs({active: 0});
              },
              "Keep": function() {
                $(this).dialog("close");
              }
            }
          });
          $(options.dialog).empty();
          $(options.dialog).append('<p>Submitted successfully.</p> <p>Clear the form or keep the data to make a similar entry?</p>');
          $(options.dialog).dialog("open" );
        } else if (options.dialog == "#dialog-edit") {
          $(options.dialog).dialog({
            modal: true,
            buttons: {
              "Okay": function() {
                $(this).dialog("close");
                $("#tab-edit #input-form").empty();
                $(".div-edit").hide();
                editID = "";
                editRev = "";
                $("#tabs").tabs({active: 0});
              }
              // "Back": function() {
              //   $(this).dialog("close");
              //   $("#tab-edit #input-form").empty();
              //   $(".div-edit").hide();
              //   editID = "";
              //   editRev = "";
              //   $("#tabs").tabs({active: 0});
              // },
              // "Keep": function() {
              //   editRev =response.rev;
              //   $(this).dialog("close");
              // }
            }
          });
          $(options.dialog).empty();
          if (options.method == "update") {
            $(options.dialog).append('<p>Assay updated successfully.</p>');
          } else {
            $(options.dialog).append('<p>Create new measurement successfully.</p> <p>Chose whether you want to go back to search page or keep its contents so you can continue editing a similar entry.</p>');
          }
          $( options.dialog ).dialog("open" );
        }
      },

      error: function(jqXHR, textStatus, errorThrown){
        $(options.dialog).empty();
        $(options.dialog).append('<p>Error'+textStatus+':'+errorThrown + "</p>");
        $(options.dialog ).dialog("open" );
      }
    });
  }

}

/** Comment. */
// Fill the result row blank
function fillResultRow(label, doc) {
  $(label+".risotope").val(doc.isotope);
  $(label+".runit").val(doc.unit);
  if (doc.type === "measurement") {
    if(doc.value.length === 1){
      $(label + ".rtype").val(types[0]);
      $(label + ".rmeas").val(doc.value[0]);
      $(label + ".rmeaserr").hide();
      $(label + ".spacer1").show().attr('disabled', true);
    } else if (doc.value.length == 2) {
      $(label + ".rtype").val(types[1]);
      $(label + ".rmeas").val(doc.value[0]);
      $(label + ".rmeaserr").val(doc.value[1]);
    } else if (doc.value.length == 3) {
      $(label + ".rtype").val(types[2]);
      $(label + ".rmeas").val(doc.value[0]);
      $(label + ".rmeaserrp").val(doc.value[1]);
      $(label + ".rmeaserrm").val(doc.value[2]);
      $(label + ".rmeaserr").hide();
      $(label + ".rmeaserrp").show();
      $(label + ".rmeaserrm").show();
      $(label + ".spacer2").hide();
    }
  } else if(doc.type === "limit") {
    if (doc.value.length === 1) {
      $(label + ".rtype").val(types[3]);
      $(label + ".rlimit").val(doc.value[0]);
      $(label + '.rlimit').show();
      $(label + ".rmeas").hide();
      $(label + ".rmeaserr").hide();
      $(label + ".spacer1").show().attr('disabled', true);
    } else if (doc.value.length === 2) {
      $(label + ".rtype").val(types[4]);
      $(label + ".rlimit").val(doc.value[0]).show();
      $(label + ".rlimitcl").val(doc.value[1]).show();
      $(label + ".rmeas").hide();
      $(label + ".rmeaserr").hide();
    }
  } else if(doc.type === "range"){
    if (doc.value.length === 2) {
      $(label + ".rtype").val(types[5]);
      $(label + ".rrangel").val(doc.value[0]).show();
      $(label + ".rrangeh").val(doc.value[1]).show();
      $(label + ".rmeas").hide();
      $(label + ".rmeaserr").hide();
    } else if (doc.value.length === 3) {
      $(label + ".rtype").val(types[6]);
      $(label + ".rrangel").val(doc.value[0]).show();
      $(label + ".rrangeh").val(doc.value[1]).show();
      $(label + ".rrangecl").val(doc.value[2]).show();
      $(label + ".rmeas").hide();
      $(label + ".rmeaserr").hide();
      $(label + ".spacer2").hide();
    }
  }
}

/** Comment. */
function fillUser(label, field, doc) {
  var len = doc.length;
  for (var i = 0; i < len; i++) {
    var clone = $(label + ".user-input-template").clone(true).removeClass(
      'user-input-template').addClass('row-user-sample');
    clone.insertAfter($(label + "." + field + "-input .user-sample-null")).show();
    // Fill the user block
    $(label + "." + field + "-input .row-user-sample:eq(0) .uname").val(doc[i]
      .name);
    $(label + "." + field + "-input .row-user-sample:eq(0) .udesc").val(doc[i]
      .description);
    $(label + "." + field + "-input .row-user-sample:eq(0) .utype").val(doc[i]
      .type);
    $(label + "." + field + "-input .row-user-sample:eq(0) .uvalue").val(doc[
      i].value);
    $(label + "." + field + "-input .row-user-sample:eq(0) .uunit").val(doc[i]
      .unit);
  }
}

/** Fill the blank */
function FillEditBlank(label, doc) {
  $(label + ' #grp').val(doc.grouping);
  // sample
  $(label + ' #sname').val(doc.sample.name);
  $(label + ' #sdesc').val(doc.sample.description);
  $(label + ' #sid').val(doc.sample.id);
  $(label + ' #ssrc').val(doc.sample.source);
  $(label + ' #sown1').val(doc.sample.owner.name);
  $(label + ' #sown2').val(doc.sample.owner.contact);
  if (!jQuery.isEmptyObject(doc.sample.user)) {
    fillUser(label, 'sample', doc.sample.user);
  }
  // measurement
  $(label + ' #minst').val(doc.measurement.institution);
  $(label + ' #mtech').val(doc.measurement.technique);
  // measurement date
  if (doc.measurement.date.length <= 1) {
    $(label + ' #mdate1').val(doc.measurement.date[0]);
  } else {
    $(label + ' #mdate2a').val(doc.measurement.date[0]);
    $(label + ' #mdate2b').val(doc.measurement.date[1]);
    $(label + ' .onedate').toggle();
    $(label + ' .twodate').toggle();
  }
  $(label + ' #mreq1').val(doc.measurement.requestor.name);
  $(label + ' #mreq2').val(doc.measurement.requestor.contact);
  $(label + ' #mprac1').val(doc.measurement.practitioner.name);
  $(label + ' #mprac2').val(doc.measurement.practitioner.contact);
  $(label + ' #mdesc').val(doc.measurement.description);
  // display results
  var len = doc.measurement.results.length;
  if (len >= 1) {
    // First result-row
    fillResultRow(label + ' .result-row:eq(1) ', doc.measurement.results[0]);
    // Add enough entry
    for (var i = 1; i < len; i++) {
      var clone = $(label + ' .input-template').clone(true).removeClass(
        'input-template').addClass('result-row');
      // insert after the first result-row
      clone.insertAfter($(label + ' .result-row:eq(1)')).show();
      fillResultRow(label + ' .result-row:eq(2) ', doc.measurement.results[i]);
    };
  }
  if (!jQuery.isEmptyObject(doc.measurement.user)) {
    fillUser(label, 'measurement', doc.measurement.user);
  }
  // Data Source
  $(label + ' #dref').val(doc.data_source.reference);
  $(label + ' #dinp1').val(doc.data_source.input.name);
  $(label + ' #dinp2').val(doc.data_source.input.contact);
  $(label + ' #dinp3').val(doc.data_source.input.date);
  $(label + ' #dnotes').val(doc.data_source.notes);
  if (!jQuery.isEmptyObject(doc.data_source.user)) {
    fillUser(label, 'data', doc.data_source.user);
  }
}

/**
 * Edit/clone an assay
 *   _id      the ID of the document
 *   method   indicates whether it should be edited or cloned
 */
function editAssay(_id, method) {
  url = urlPrefix + '/' + prefix + '/' + _id;
  $.ajax({
    url: url,
    dataType: 'json',
    async: false,
    success: function(data) {
      if (data._id) {
        // Store document identifiers in global variables
        editID = data._id;
        editRev = data._rev;
        var tabChoice = '#tab-edit ';
        var tabNumber = 2;
        var divChoice = '.div-edit ';
        if (method === 'clone') {
          tabChoice = '#tab-submit '
          tabNumber = 1;
          divChoice = '.div-submit '
        }
        $(tabChoice + ' #input-form').empty();
        $(divChoice).show();
        options = {
          'label': tabChoice,
          'doc': data,
          'method': method
        };
        createAssayPage(options);
        $('#tabs').tabs({
          active: tabNumber
        });
      }
    }
  })
}

/** Upload new settings */
function updateSettings() {
  // Validate number of entries
  var maxEntries = $('#max-entry').val();
  if ($.isNumeric(maxEntries) && maxEntries >= 10 && maxEntries <= 100) {
    localSettings.max_entries = parseInt(maxEntries);
  } else return;
  // Validate error email address
  var errorEmail = $('#error-email').val();
  if (errorEmail !== '') {
    localSettings.error_email = errorEmail;
  } else return;
  // Validate use Lucene flag
  var useLucene = $('#lucene').val();
  if ($.isNumeric(useLucene) && useLucene > -1 && useLucene < 2) {
    localSettings.use_lucene = parseInt(useLucene);
  } else return;
  // Save settings
  db.saveDoc(localSettings, {
    success: function(response, textStatus, jqXHR) {
      $('#dialog-settings').dialog({
        modal: true,
        buttons: {
          'Okay': function() {
            $(this).dialog('close');
          }
        }
      });
      $('#dialog-settings').empty();
      $('#dialog-settings').append('<p>Update successful.</p>');
      $('#dialog-settings').dialog('open');
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $('#dialog-settings').empty();
      $('#dialog-settings').append('<p>Error' + textStatus + ':' +
        errorThrown + '</p>');
      $('#dialog-settings').dialog('open');
    }
  });
}

/** Comment. */
function saveToDisk(fileURL, fileName) {
  // for non-IE
  if (!window.ActiveXObject) {
    var save = document.createElement('a');
    save.href = fileURL;
    save.target = '_blank';
    save.download = fileName || 'unknown';

    var event = document.createEvent('Event');
    event.initEvent('click', true, true);
    save.dispatchEvent(event);
    (window.URL || window.webkitURL).revokeObjectURL(save.href);
  }

  // for IE
  else if ( !! window.ActiveXObject && document.execCommand) {
    var _window = window.open(fileURL, '_blank');
    _window.document.close();
    _window.document.execCommand('SaveAs', true, fileName || fileURL)
    _window.close();
  }
}

<<<<<<< HEAD
	// Logo
	if (db.name === "rp" || db.name === "mj") {
        $("#logo").attr("src", "images/" + db.name + ".png");
    } else {
        $("#logo").attr("src", "images/logo3.png");
    }
=======
$(document).ready(function() {
>>>>>>> c7edcf5462a65f7aff8ff8627cb9d8b5628bba36

  // Logo
  if (db.name === 'rp') {
    $('#logo').attr('src', 'images/' + db.name + '.svg');
  } else {
    $('#logo').attr('src', 'images/logo.svg');
  }

  // Tabs
  $('#tabs').tabs({
    disabled: [1, 2, 3]
  });

  $('#tabs').tabs({
    select: function(event, ui){
      $("div.ui-tooltip").remove();
    }
  });

  // Menu bars
  $('input:submit', '.menu-bar').button();
  $('.menu-bar').click(function() {return false;});

  // Plug-in to style placeholder in old browsers
  $('input, textarea').placehold('something-temporary');

  /* Submit tab initialization */
  var options = {'label': '#tab-submit ', 'method': 'submit'};
  createAssayPage(options);

  $('div#disclaimer').hide();

  var text_1 = 'Display disclaimers';
  var text_2 = 'Hide disclaimers';

  $('span#disclaimers').click(function(e) {
    $('div#disclaimer').fadeToggle();
    if ($('span#disclaimers').text() === text_1) {
      $('span#disclaimers').text(text_2);
      $('html, body').animate({scrollTop: $(document).height()}, 1000);
    } else {
      $('span#disclaimers').text(text_1);
    }
    e.preventDefault();
  });

  // Display template
  $.get('templates/details_output.html', function(tmp) {
    $.template('details_output', tmp);
  });

  // Heading template
  $.get('templates/heading_output.html', function(tmp) {
    $.template('heading_output', tmp);
  });

  // Search button initialization

  $('#button-search').button({
    icons: {primary: 'ui-icon-search'},
    text: false
  });

  $('#button-show-more').button({
    icons: {primary: 'ui-icon-carat-1-e'},
    text: false
  });

  $('#button-expand-all').button({
    icons: {primary: 'ui-icon-circle-zoomin'},
    text: false
  });

  $('#button-show-all').button();

  $('#button-download-expanded').button();

  // Show more button animation
  $('#button-show-more').bind('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    $('.button-more').not('#button-show-more').toggle(100);
    $('.ui-button-icon-primary', this).toggleClass('ui-icon-carat-1-e ui-icon-carat-1-w');
  });

  // Collapse all fucntion
  $('#button-show-all').bind('click', function() {
    var entry = $('#box-search').val();
    var old_max = localSettings.max_entries;
    localSettings.max_entries = 100;
    options = {'_search': '&sort=[\'grouping<string>\']', '_view': 'query-by-group'};
    searchResults(entry, options);
    localSettings.max_entries = old_max;
  });

  // Download all the expanded result into csv
  $("#button-download-expanded").bind("click", function() {
    var idlist = new Array();
    //$(".accordion:visible .ui-accordion-header-active").each(function(){
    $(".accordion:visible").each(function () {
      var parent = $(this).closest('.accordion');
      idlist.push('"' + parent.attr('value') + '"');
    });
    var url = window.location.protocol + '//' + window.location.host
            + '/' + prefix
            + '/_design/persephone/_list/exportCSV/assay.csv?idlist=['
            + idlist + ']';
    window.open(url, '_blank');
  });

  // User login
  $("#contactForm").couchLogin({
    loggedIn: function() {
      $("#tabs").tabs({disabled: []});
      loginFlag = 1;
      $(".edit-menu").removeClass("ui-state-disabled"); // enable edit
    },
    loggedOut: function() {
      $("#tabs").tabs({disabled: [1, 2, 3]});
      loginFlag = 0;
      $(".edit-menu").addClass("ui-state-disabled"); // disable edit
    }
  });

  // Decorate table-header
  $('.table-header').accordion({
    header: 'h3',
    icons: false,
    collapsible: true,
    disabled: true,
    heightStyle: 'content'
  });
  $('.table-header').hide();

  // Hide #back-top first
  $('#back-top').hide();
  $('#spinner').hide();

  // Fade in #back-top
  $(function() {
    $(window).scroll(function() {
      if ($(this).scrollTop() > 100) {
        $('#back-top').fadeIn();
      } else {
        $('#back-top').fadeOut();
      }
    });
    // Scroll body to 0px on click
    $('#back-top a').click(function() {
      $('body,html').animate({
        scrollTop: 0
      }, 400);
      return false;
    });
  });

  // Settings template
  $.get('templates/default_settings.html', function(tmp) {
    $.template('setting_template', tmp);

    var tt = $.tmpl('setting_template');
    $('#tab-settings #input-form').append(tt);

    $('#tab-settings').children().tooltip({
      position: {my: 'left+15 center', at: 'right center'}
    });

    $('#tab-settings #button-settings').button();

    $.ajax({
      url: '/' + prefix + '/settings',
      dataType: 'json',
      async: false,
      success: function(data) {
        localSettings = data;
      }
    });
    $('#max-entry').val(localSettings.max_entries);
    $('#error-email').val(localSettings.error_email);
    $('#lucene').val(localSettings.use_lucene);
  });


<<<<<<< HEAD
	$("#button-show-all").button();

	$("#button-download-expanded").button();

	// Show more button animation
	$("#button-show-more").bind("click", function (event) {
		event.stopPropagation();
		event.preventDefault();
		$(".button-more").not("#button-show-more").toggle(100);
		$(".ui-button-icon-primary", this).toggleClass("ui-icon-carat-1-e ui-icon-carat-1-w");

	});

	// Collapse all fucntion
	$("#button-show-all").bind("click", function () {
        var entry = $("#box-search").val();
        var old_max = default_settings.max_entries;
        default_settings.max_entries = 100;
        options = {"_search": "&sort=[\"grouping<string>\"]", "_view": "query-by-group"};
        searchResults(entry, options);
        default_settings.max_entries = old_max;
	});

	// Download all the expanded result into csv
	$("#button-download-expanded").bind("click", function () {
		var idlist = new Array();
		//$(".accordion:visible .ui-accordion-header-active").each(function(){
		$(".accordion:visible").each(function () {
			var parent = $(this).closest('.accordion');
			idlist.push('"' + parent.attr('value') + '"');
		});
		var url = window.location.protocol + '//' + window.location.host
				+ '/' + dbname
                + '/_design/persephone/_list/exportCSV/assay.csv?idlist=['
                + idlist + ']';
		window.open(url, '_blank');
	});

	/* Search functions */

	// Query-by-group
//	$(".group-header").click(function () {
//		// Change color of selected value
//		$(".header").css("color", "#212121");
//		$(".group-header").css("color", "#edad42");
//		options = {
//            "_search": "&sort=[\"grouping<string>\"]",
//            "_view": "query-by-group"
//        };
//		searchResults(val, options);
//	});

	// Query-by-name
//	$(".name-header").click(function () {
//		// Change color of selected value
//		$(".header").css("color", "#212121");
//		$(".name-header").css("color", "#edad42");
//		options = {
//            "_search": "&sort=[\"name<string>\"]",
//            "_view": "query-by-name"
//        };
//		searchResults(val, options);
//	});

	// Sort-by-Th
//	$(".th-header").click(function () {
//		// Change color of selected value
//		$(".header").css("color", "#212121");
//		$(".th-header").css("color", "#edad42");
//		options = {
//            "_search": "&sort=[\"th<number>\"]",
//            "_view": "query-by-th"
//        };
//		searchResults(val, options);
//	});

	// Sort-by-U
//	$(".u-header").click(function () {
//		// Change color of selected value
//		$(".header").css("color", "#212121");
//		$(".u-header").css("color", "#edad42");
//		options = {
//            "_search": "&sort=[\"u<number>\"]",
//            "_view": "query-by-u"
//        };
//		searchResults(val, options);
//	});

	// Decorate table-header
	$(".table-header").accordion({
        header: "h3",
        icons: false,
        collapsible: true,
        disabled: true,
        heightStyle: "content"
    });
	$(".table-header").hide();

	// Hide #back-top first
	$("#back-top").hide();
	$("#spinner").hide();

	// Fade in #back-top
	$(function () {
		$(window).scroll(function () {
			if ($(this).scrollTop() > 100) {
				$('#back-top').fadeIn();
			} else {
				$('#back-top').fadeOut();
			}
		});
		// Scroll body to 0px on click
		$('#back-top a').click(function () {
			$('body,html').animate({
				scrollTop: 0
			}, 400);
			return false;
		});
	});

	/* Setting tab settings */

    // Input form template
	$.get('templates/default_settings.html', function (tmp) {
		$.template("setting_template", tmp);

		var tt = $.tmpl("setting_template");
		$("#tab-settings #input-form").append(tt);

		// Tooltip positions
		$("#tab-settings ").children().tooltip({
			position: { my: "left+15 center", at: "right center" }
		});

		$("#tab-settings #button-settings").button();

		$.ajax({
			url: '/' + dbname + '/settings',
			dataType: 'json',
			async: false,
			success: function(data) {
				default_settings = data;
			}

		});

		$("#max-entry").val(default_settings.max_entries);
		$("#error-email").val(default_settings.error_email);
	});
=======
>>>>>>> c7edcf5462a65f7aff8ff8627cb9d8b5628bba36

});


$(window).bind("load", function() {
  // Check to see if a search argument has been passed to the app
  locationString = window.location.href;
  if (locationString.indexOf("?") > -1) {
    queryString = locationString.split(/\?(.+)?/)[1];
    searchString = decodeURI(queryString);
    $("#box-search").val(searchString);
    click_search();
    $("#box-search").focus();
  } else {
    $("#box-search").focus();
  }
});
